import React from 'react';
import { Controller } from 'react-hook-form';
import { MemoEditor } from '@/features/memo/MemoEditor';
import { useMemoEditorForm } from './hooks/useMemoEditorForm';
import type { MemoDetail } from '@/types/api';

interface MemoEditorControllerProps {
	selectedMemoId: number | null;
	onMemoUpdated?: (updatedMemo: MemoDetail) => void;
}

export const MemoEditorController: React.FC<MemoEditorControllerProps> = ({
	selectedMemoId,
	onMemoUpdated,
}) => {
	const {
		control,
		isLoadingMemo,
		isSaving,
		serverError,
		currentMemo,
		formMethods,
		formState,
		handleSave,
		editorContent,
	} = useMemoEditorForm({ selectedMemoId, onMemoUpdated });

	const { handleSubmit, setValue } = formMethods;
	const { errors, isDirty, isFormValid } = formState;

	const isEditorDisabled = !selectedMemoId || isLoadingMemo;

	if (isLoadingMemo && !currentMemo) {
		return <p className='text-center p-4 animate-pulse'>メモを読み込み中...</p>;
	}
	if (serverError && !currentMemo) {
		return (
			<p className='text-center p-4 text-red-500'>エラー: {serverError}</p>
		);
	}
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
						content={editorContent}
						onTitleChange={field.onChange}
						onContentChange={(e) =>
							setValue('content', e.target.value, {
								shouldDirty: true,
								shouldValidate: true,
							})
						}
						onSave={handleSubmit(handleSave)}
						isSavable={isDirty && isFormValid}
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
