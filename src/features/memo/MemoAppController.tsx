import React, { useState, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { getCategories } from '@/services/categoryService';
import {
	createMemo,
	deleteMemo as apiDeleteMemo,
	getMemoDetail,
} from '@/services/memoService';
import { CategoryList } from '@/components/categories/CategoryList';
import { CreateMemoButton } from '@/components/memo/CreateMemoButton';
import { DeleteMemoButton } from '@/components/memo/DeleteMemoButton';
import { MemoListLoader } from './MemoListLoader';
import { MemoEditorController } from './MemoEditorController';
import type { CreateMemoPayload, MemoDetail, Category } from '@/types/api';
import { Result } from '@/lib/result';
import { AccessToken } from '@/domain/auth/types';

export const MemoAppController: React.FC = () => {
	const { accessToken } = useAuth();
	const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
		null
	);
	const [selectedMemoId, setSelectedMemoId] = useState<number | null>(null);
	const { mutate } = useSWRConfig();
	const [categoryOfSelectedMemo, setCategoryOfSelectedMemo] = useState<
		number | null
	>(null);

	const {
		data: categoriesResult,
		error: categoriesError,
		isLoading: isLoadingCategories,
	} = useSWR<Result<Category[], Error>>(
		accessToken ? ['/categories', accessToken] : null,
		async (key) => {
			const [, tokenArg] = key as [string, AccessToken];
			return getCategories(tokenArg);
		}
	);

	const handleCategoryToggle = useCallback((categoryId: number) => {
		setExpandedCategoryId((currentId) => {
			const newExpandedId = currentId === categoryId ? null : categoryId;
			if (newExpandedId !== categoryId || newExpandedId === null) {
				// カテゴリが変更されたか閉じられた場合、メモ選択と関連カテゴリを解除
				setSelectedMemoId(null);
				setCategoryOfSelectedMemo(null);
			}
			return newExpandedId;
		});
	}, []);

	const handleMemoSelect = useCallback(
		(memoId: number, categoryIdFromList?: number) => {
			setSelectedMemoId(memoId);
			if (categoryIdFromList) {
				setCategoryOfSelectedMemo(categoryIdFromList);
				console.log(
					`Memo selected: ${memoId} in category: ${categoryIdFromList}`
				);
			} else if (expandedCategoryId) {
				// フォールバック: メモリストからカテゴリIDが渡されなかった場合 (通常は渡されるべき)
				setCategoryOfSelectedMemo(expandedCategoryId);
				console.log(
					`Memo selected: ${memoId} (using currently expanded category: ${expandedCategoryId} as fallback)`
				);
			} else {
				// カテゴリIDが全く特定できない場合
				setCategoryOfSelectedMemo(null); // 不明な場合はnullに設定
				console.warn(
					`Memo selected: ${memoId}, but no categoryId was provided or could be inferred. categoryOfSelectedMemo is null.`
				);
			}
		},
		[expandedCategoryId] // expandedCategoryId が変更された際にこのコールバックが再生成されるように
	);

	const handleMemoUpdated = useCallback(
		async (updatedMemo: MemoDetail) => {
			if (accessToken && updatedMemo.category_id) {
				const listKey = [
					`/memo/category/${updatedMemo.category_id}`,
					accessToken,
					updatedMemo.category_id,
				];
				await mutate(listKey);
			}
		},
		[accessToken, mutate]
	);

	const handleCreateMemo = useCallback(async () => {
		if (!expandedCategoryId || !accessToken) return;
		const newMemoPayload: CreateMemoPayload = {
			category_id: expandedCategoryId,
			title: '新規メモ',
			content: '',
		};
		const result = await createMemo(accessToken, newMemoPayload);
		if (result.ok) {
			const newMemo = result.value;
			const listKey = [
				`/memo/category/${expandedCategoryId}`,
				accessToken,
				expandedCategoryId,
			];
			await mutate(listKey);
			setSelectedMemoId(newMemo.id);
			setCategoryOfSelectedMemo(newMemo.category_id); // 新規作成時はAPIレスポンスからカテゴリIDを設定
		} else {
			console.error('新規メモの作成に失敗しました:', result.error.message);
			alert(`新規メモの作成に失敗しました: ${result.error.message}`);
		}
	}, [expandedCategoryId, accessToken, mutate]);

	const handleDeleteMemo = useCallback(async () => {
		if (!selectedMemoId || !accessToken) {
			alert('削除するメモが選択されていません。');
			return;
		}

		let categoryIdToUpdate = categoryOfSelectedMemo;

		// categoryOfSelectedMemo が null の場合 (例: URLから直接メモIDが指定されたが、カテゴリが不明な場合など)
		// フォールバックとして、選択中のメモの詳細をAPIから取得してカテゴリIDを特定します。
		if (!categoryIdToUpdate) {
			console.warn(
				`Category of selected memo (${selectedMemoId}) is unknown. Fetching memo details to determine category for cache update.`
			);
			const detailResult = await getMemoDetail(accessToken, selectedMemoId);
			if (detailResult.ok) {
				categoryIdToUpdate = detailResult.value.category_id;
				// ここで setCategoryOfSelectedMemo(categoryIdToUpdate) を呼んでも良いが、
				// この関数のスコープ内では categoryIdToUpdate 変数で処理を進める。
				// 呼び出し元で状態がリセットされるので、ここでstateを更新する必要性は低い。
			} else {
				alert(
					`削除対象メモのカテゴリ情報を取得できませんでした（ID: ${selectedMemoId}）。リストの更新が正しく行われない可能性があります。`
				);
				// カテゴリIDが不明なままでは正しいキャッシュキーをmutateできないので、処理を中断することも検討
				return;
			}
		}

		if (!categoryIdToUpdate) {
			// 上記フォールバックでも解決できなかった場合
			alert(
				'メモのカテゴリ情報が特定できませんでした。削除後のリスト更新が行えません。'
			);
			return;
		}

		const result = await apiDeleteMemo(accessToken, selectedMemoId);

		if (result.ok) {
			console.log(
				`Memo ${selectedMemoId} deleted successfully from category ${categoryIdToUpdate}.`
			);
			const listKey = [
				`/memo/category/${categoryIdToUpdate}`,
				accessToken,
				categoryIdToUpdate,
			];
			await mutate(listKey);
			setSelectedMemoId(null); // メモ選択を解除
			setCategoryOfSelectedMemo(null); // 関連カテゴリIDもリセット
		} else {
			console.error('メモの削除に失敗しました:', result.error.message);
			alert(`メモの削除に失敗しました: ${result.error.message}`);
		}
	}, [selectedMemoId, accessToken, categoryOfSelectedMemo, mutate]);

	const renderMemosForCategory = useCallback(
		(categoryId: number) => {
			return (
				<MemoListLoader
					categoryId={categoryId}
					selectedMemoId={selectedMemoId}
					onMemoSelect={(memoId) => handleMemoSelect(memoId, categoryId)} // categoryIdを渡す
				/>
			);
		},
		[selectedMemoId, handleMemoSelect] // handleMemoSelectを依存配列に追加
	);

	// カテゴリデータのロード状態に基づく早期リターン (変更なし)
	if (isLoadingCategories) {
		/* ... */
	}
	if (categoriesError) {
		/* ... */
	}
	if (!categoriesResult || !categoriesResult.ok) {
		/* ... */
	}

	const categories =
		categoriesResult && categoriesResult.ok
			? categoriesResult.value
			: undefined;

	return (
		<div className='container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4'>
			<aside className='md:col-span-1 p-4 bg-white rounded-xl shadow-lg'>
				<div className='flex justify-between items-center mb-6 border-b pb-3'>
					<h2 className='text-2xl font-semibold text-gray-800'>カテゴリ一覧</h2>
					<CreateMemoButton
						onClick={handleCreateMemo}
						isDisabled={!expandedCategoryId}
					/>
				</div>
				<CategoryList
					categories={categories ?? []}
					expandedCategoryId={expandedCategoryId}
					onCategoryToggle={handleCategoryToggle}
					renderMemosForCategory={renderMemosForCategory}
				/>
			</aside>

			<section className='md:col-span-2 p-4 bg-white rounded-xl shadow-lg min-h-[calc(100vh-150px)]'>
				<div className='flex justify-between items-center mb-6 border-b pb-3'>
					<h2 className='text-2xl font-semibold text-gray-800'>
						メモ詳細・編集
					</h2>
					<DeleteMemoButton
						onClick={handleDeleteMemo}
						isDisabled={!selectedMemoId}
					/>
				</div>
				<MemoEditorController
					selectedMemoId={selectedMemoId}
					onMemoUpdated={handleMemoUpdated}
					onEditorClose={() => {
						setSelectedMemoId(null);
						setCategoryOfSelectedMemo(null);
					}}
				/>
			</section>
		</div>
	);
};
