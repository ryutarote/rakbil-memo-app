import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form'; // React Hook Form を使用
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { getMemoDetail, updateMemo } from '@/services/memoService';
import type { MemoDetail, UpdateMemoPayload } from '@/types/api';
import { MemoEditor } from '@/features/memo/MemoEditor';
import { useSWRConfig } from 'swr';

interface MemoEditorControllerProps {
	selectedMemoId: number | null;
	onEditorClose?: () => void; // 保存後や選択解除時にエディタを閉じる/リセットするコールバック
	onMemoUpdated?: (updatedMemo: MemoDetail) => void; // メモ更新成功を親に通知
}

// フォームバリデーションスキーマ (任意、ここでは単純な必須チェック程度)
const memoFormSchema = z.object({
	title: z.string().min(1, { message: 'タイトルは必須です。' }),
	content: z.string(), // 内容は任意とする例
});

type MemoFormInputs = z.infer<typeof memoFormSchema>;

export const MemoEditorController: React.FC<MemoEditorControllerProps> = ({
	selectedMemoId,
	onMemoUpdated,
}) => {
	const { accessToken } = useAuth();
	const { mutate } = useSWRConfig(); // SWRキャッシュの手動更新用

	const [isLoadingMemo, setIsLoadingMemo] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [currentMemo, setCurrentMemo] = useState<MemoDetail | null>(null);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isValid: isFormValid }, // isDirtyで変更があったか検知
		watch,
		setValue,
	} = useForm<MemoFormInputs>({
		resolver: zodResolver(memoFormSchema),
		defaultValues: { title: '', content: '' },
	});

	// selectedMemoIdが変更されたらメモを読み込む
	useEffect(() => {
		if (selectedMemoId && accessToken) {
			setIsLoadingMemo(true);
			setServerError(null);
			getMemoDetail(accessToken, selectedMemoId).then((result) => {
				if (result.ok) {
					setCurrentMemo(result.value);
					reset({ title: result.value.title, content: result.value.content });
				} else {
					setServerError(result.error.message);
					setCurrentMemo(null);
					reset({ title: '', content: '' }); // エラー時はフォームをリセット
				}
				setIsLoadingMemo(false);
			});
		} else {
			setCurrentMemo(null);
			reset({ title: '', content: '' }); // IDがなければリセット
			setIsLoadingMemo(false);
		}
	}, [selectedMemoId, accessToken, reset]);

	const handleSave = useCallback(
		async (formData: MemoFormInputs) => {
			if (!selectedMemoId || !currentMemo || !accessToken) return;

			setIsSaving(true);
			setServerError(null);

			const payload: UpdateMemoPayload = {
				category_id: currentMemo.category_id, // 元のカテゴリIDを維持
				title: formData.title,
				content: formData.content,
			};

			const result = await updateMemo(accessToken, selectedMemoId, payload);
			setIsSaving(false);

			if (result.ok) {
				// SWRキャッシュを更新して関連するメモ一覧を再検証させる
				// 1. このメモの詳細キャッシュを更新
				mutate([`/memo/${selectedMemoId}`, accessToken]); // キーはgetMemoDetailのSWRキーに合わせる（もしSWRで詳細取得していれば）
				// 2. このメモが含まれるカテゴリのメモ一覧キャッシュを更新
				mutate([
					`/memo/category/${currentMemo.category_id}`,
					accessToken,
					currentMemo.category_id,
				]);

				setCurrentMemo(result.value); // 保存後のデータで現在のメモを更新
				reset({ title: result.value.title, content: result.value.content }); // フォームを保存後の値でリセット (isDirtyもfalseになる)

				if (onMemoUpdated) onMemoUpdated(result.value);
				// onEditorClose?.(); // 必要であればエディタを閉じる
			} else {
				setServerError(result.error.message);
			}
		},
		[selectedMemoId, currentMemo, accessToken, reset, mutate, onMemoUpdated]
	);

	const isEditorDisabled = !selectedMemoId || isLoadingMemo;

	if (isLoadingMemo && !currentMemo) {
		// 初回ロード時など
		return <p className='text-center p-4 animate-pulse'>メモを読み込み中...</p>;
	}
	if (serverError && !currentMemo) {
		// メモの読み込みに失敗した場合
		return (
			<p className='text-center p-4 text-red-500'>エラー: {serverError}</p>
		);
	}
	// メモが選択されていない場合は何も表示しないか、プレースホルダを表示
	if (!selectedMemoId) {
		return (
			<div className='flex flex-col items-center justify-center h-full text-gray-400'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-20 w-20 mb-4 opacity-30'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
					strokeWidth='1'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
					/>
				</svg>
				<p className='text-lg'>メモを選択して編集を開始します。</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(handleSave)}>
			<Controller
				name='title'
				control={control}
				render={({ field }) => (
					<MemoEditor
						title={field.value}
						content={watch('content')} // contentも同様にControllerでラップするか、watchで取得
						onTitleChange={field.onChange}
						onContentChange={(e) =>
							setValue('content', e.target.value, {
								shouldDirty: true,
								shouldValidate: true,
							})
						}
						onSave={handleSubmit(handleSave)} // handleSubmitでラップして呼び出す
						isSavable={isDirty && isFormValid} // 変更があり、かつバリデーションOKの場合のみ保存可能
						isSaving={isSaving}
						isDisabled={isEditorDisabled}
					/>
				)}
			/>
			{serverError && (
				<p className='mt-2 text-sm text-red-500 text-center'>{serverError}</p>
			)}
			{errors.title && (
				<p className='mt-1 text-xs text-red-600'>{errors.title.message}</p>
			)}
			{errors.content && (
				<p className='mt-1 text-xs text-red-600'>{errors.content.message}</p>
			)}
		</form>
	);
};
