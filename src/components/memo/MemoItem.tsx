import React from 'react';
import type { Memo } from '@/types/api';

interface MemoItemProps {
	memo: Memo;
	isSelected: boolean;
	onMemoSelect: (memoId: number) => void;
}

export const MemoItem: React.FC<MemoItemProps> = ({
	memo,
	isSelected,
	onMemoSelect,
}) => {
	return (
		<li
			id={`memo-${memo.id}`}
			className={`py-2 px-3 rounded-md cursor-pointer transition-colors duration-150 ease-in-out
        ${
					isSelected
						? 'bg-indigo-500 text-white font-semibold'
						: 'hover:bg-indigo-100'
				}`}
			onClick={() => onMemoSelect(memo.id)}
			role='button'
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') onMemoSelect(memo.id);
			}}
			aria-pressed={isSelected}
		>
			{memo.title}
		</li>
	);
};
