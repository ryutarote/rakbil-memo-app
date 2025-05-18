import { useState, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { getCategories } from '@/services/categoryService';
import {
	createMemo,
	deleteMemo as apiDeleteMemo,
	getMemoDetail,
} from '@/services/memoService';
import type { CreateMemoPayload, MemoDetail, Category } from '@/types/api';
import type { Result } from '@/lib/result';
import type { AccessToken } from '@/domain/auth/types';

export function useMemoApp() {
	const { accessToken } = useAuth();
	const { mutate } = useSWRConfig();

	const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
		null
	);
	const [selectedMemoId, setSelectedMemoId] = useState<number | null>(null);
	const [categoryOfSelectedMemo, setCategoryOfSelectedMemo] = useState<
		number | null
	>(null);
	const [operationError, setOperationError] = useState<string | null>(null);

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
				setSelectedMemoId(null);
				setCategoryOfSelectedMemo(null);
			}
			return newExpandedId;
		});
	}, []);

	const handleMemoSelect = useCallback(
		(memoId: number, categoryIdFromList?: number) => {
			setSelectedMemoId(memoId);
			setOperationError(null);
			if (categoryIdFromList) {
				setCategoryOfSelectedMemo(categoryIdFromList);
			} else if (expandedCategoryId) {
				setCategoryOfSelectedMemo(expandedCategoryId);
			} else {
				setCategoryOfSelectedMemo(null);
			}
		},
		[expandedCategoryId]
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
		setOperationError(null);
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
			setCategoryOfSelectedMemo(newMemo.category_id);
		} else {
			console.error('新規メモの作成に失敗しました:', result.error.message);
			setOperationError(`新規メモの作成に失敗: ${result.error.message}`);
		}
	}, [expandedCategoryId, accessToken, mutate]);

	const handleDeleteMemo = useCallback(async () => {
		if (!selectedMemoId || !accessToken) {
			setOperationError('削除するメモが選択されていません。');
			return;
		}
		setOperationError(null);

		let categoryIdToUpdate = categoryOfSelectedMemo;
		if (!categoryIdToUpdate) {
			const detailResult = await getMemoDetail(accessToken, selectedMemoId);
			if (detailResult.ok) {
				categoryIdToUpdate = detailResult.value.category_id;
			} else {
				setOperationError(`削除対象メモのカテゴリ情報を取得できませんでした。`);
				return;
			}
		}
		if (!categoryIdToUpdate) {
			setOperationError('メモのカテゴリ情報が特定できませんでした。');
			return;
		}

		const result = await apiDeleteMemo(accessToken, selectedMemoId);
		if (result.ok) {
			const listKey = [
				`/memo/category/${categoryIdToUpdate}`,
				accessToken,
				categoryIdToUpdate,
			];
			await mutate(listKey);
			setSelectedMemoId(null);
			setCategoryOfSelectedMemo(null);
		} else {
			console.error('メモの削除に失敗しました:', result.error.message);
			setOperationError(`メモの削除に失敗: ${result.error.message}`);
		}
	}, [selectedMemoId, accessToken, categoryOfSelectedMemo, mutate]);

	const handleEditorClose = useCallback(() => {
		setSelectedMemoId(null);
		setCategoryOfSelectedMemo(null);
	}, []);

	return {
		isLoadingCategories,
		categoriesError,
		categories: categoriesResult?.ok ? categoriesResult.value : undefined,
		expandedCategoryId,
		selectedMemoId,
		operationError,
		handleCategoryToggle,
		handleMemoSelect,
		handleMemoUpdated,
		handleCreateMemo,
		handleDeleteMemo,
		handleEditorClose,
	};
}
