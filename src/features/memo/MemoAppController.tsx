import React, { useCallback } from 'react';
import { CategoryList } from '@/components/categories/CategoryList';
import { CreateMemoButton } from '@/components/memo/CreateMemoButton';
import { DeleteMemoButton } from '@/components/memo/DeleteMemoButton';
import { MemoListLoader } from './MemoListLoader';
import { MemoEditorController } from './MemoEditorController';
import { useMemoApp } from './hooks/useMemoApp';

export const MemoAppController: React.FC = () => {
	const {
		isLoadingCategories,
		categoriesError,
		categories,
		expandedCategoryId,
		selectedMemoId,
		operationError,
		handleCategoryToggle,
		handleMemoSelect,
		handleMemoUpdated,
		handleCreateMemo,
		handleDeleteMemo,
	} = useMemoApp();

	// MemoListLoader に渡す onMemoSelect が handleMemoSelect に依存し、
	// handleMemoSelect は selectedMemoId の state をクロージャに持つため。
	// hooksに移動させると、selectedMemoId の更新がフック内のコールバックに反映されにくい。
	const renderMemosForCategory = useCallback(
		(categoryId: number) => {
			return (
				<MemoListLoader
					categoryId={categoryId}
					selectedMemoId={selectedMemoId} // hooksから取得した最新の state
					onMemoSelect={(memoId) => handleMemoSelect(memoId, categoryId)}
				/>
			);
		},
		[selectedMemoId, handleMemoSelect]
	);

	if (isLoadingCategories) {
		return (
			<div className='container mx-auto p-4'>
				<p className='animate-pulse'>カテゴリを読み込み中...</p>
			</div>
		);
	}
	if (categoriesError) {
		return (
			<div className='container mx-auto p-4'>
				<p className='text-red-500'>
					カテゴリの読み込みに失敗: {categoriesError.message}
				</p>
			</div>
		);
	}
	if (!categories) {
		return (
			<div className='container mx-auto p-4'>
				<p>カテゴリデータがありません。</p>
			</div>
		);
	}
	// メモ操作時のエラー表示 (例)
	const MemoOperationErrorDisplay = operationError ? (
		<div className='my-2 p-2 bg-red-100 text-red-700 rounded text-sm text-center'>
			{operationError}
		</div>
	) : null;

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
				{MemoOperationErrorDisplay} {/* エラー表示をここにも */}
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
				{MemoOperationErrorDisplay}
				<MemoEditorController
					selectedMemoId={selectedMemoId}
					onMemoUpdated={handleMemoUpdated}
				/>
			</section>
		</div>
	);
};
