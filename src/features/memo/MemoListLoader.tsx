import React from 'react';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { getMemosByCategory } from '@/services/memoService';
import { MemoList } from '@/components/memo/MemoList';
import type { AccessToken } from '@/domain/auth/types';

interface MemoListLoaderProps {
	categoryId: number;
	selectedMemoId: number | null;
	onMemoSelect: (memoId: number) => void;
}

export const MemoListLoader: React.FC<MemoListLoaderProps> = ({
	categoryId,
	selectedMemoId,
	onMemoSelect,
}) => {
	const { accessToken } = useAuth();

	const swrKey =
		accessToken && categoryId
			? [`/memo/category/${categoryId}`, accessToken, categoryId]
			: null;

	const {
		data: memosResult,
		error,
		isLoading,
	} = useSWR(swrKey, async (key) => {
		// keyが配列であることを前提に型アサーション
		const [, token, catId] = key as [string, AccessToken, number];
		return getMemosByCategory(token, catId);
	});

	if (isLoading) {
		return (
			<p className='text-sm text-gray-500 animate-pulse'>メモを読み込み中</p>
		);
	}

	if (error) {
		return (
			<p className='text-sm text-red-600'>
				メモの読み込みに失敗しました。: {error.message}
			</p>
		);
	}

	if (!memosResult) {
		// 初期ロード時やキーがnullの場合など、データがないがエラーでもローディングでもない状態
		return <p className='text-sm text-gray-500'>表示するメモがありません。</p>;
	}

	if (!memosResult.ok) {
		const errorMessage = memosResult.error?.message || 'Failed to load memos.';
		return <p className='text-sm text-red-600'>{errorMessage}</p>;
	}

	const memos = memosResult.value;

	console.log('MemoListLoader: memos', memos);

	return (
		<MemoList
			memos={memos}
			selectedMemoId={selectedMemoId}
			onMemoSelect={onMemoSelect}
		/>
	);
};
