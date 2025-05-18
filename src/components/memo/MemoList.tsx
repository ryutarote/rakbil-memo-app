import React from 'react';
import type { Memo } from '@/types/api';
import { MemoItem } from './MemoItem';

interface MemoListProps {
	memos: Memo[];
	onMemoSelect: (memoId: number) => void;
	selectedMemoId: number | null;
}

export const MemoList: React.FC<MemoListProps> = ({
	memos,
	onMemoSelect,
	selectedMemoId,
}) => {
	if (memos.length === 0) {
		return (
			<p className='text-sm text-gray-500 italic'>
				このカテゴリにはメモがありません。
			</p>
		);
	}

	return (
		<ul className='space-y-1 list-none p-0 m-0'>
			{memos.map((memo) => (
				<MemoItem
					key={memo.id}
					memo={memo}
					isSelected={selectedMemoId === memo.id}
					onMemoSelect={onMemoSelect}
				/>
			))}
		</ul>
	);
};
