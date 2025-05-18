import React from 'react';
import type { Category } from '@/types/api';

interface CategoryItemProps {
	category: Category;
	isExpanded: boolean;
	onToggleClick: () => void;
	children?: React.ReactNode;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
	category,
	isExpanded,
	onToggleClick,
	children,
}) => {
	return (
		<div
			id={`category-${category.id}`}
			className='mb-2 border border-gray-200 rounded-lg shadow-sm overflow-hidden'
		>
			<h3
				id={`category-${category.id}-title`}
				onClick={onToggleClick}
				className={`p-3 ${
					isExpanded
						? 'bg-indigo-500 text-white'
						: 'bg-gray-50 hover:bg-gray-100 text-gray-800'
				} cursor-pointer font-medium transition-colors duration-150 ease-in-out`}
				role='button'
				aria-expanded={isExpanded}
				aria-controls={`memos-for-category-${category.id}`}
				tabIndex={0} // キーボード操作を可能にするために tabIndex を追加
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') onToggleClick();
				}} // キーボード操作
			>
				{category.name}
			</h3>
			{isExpanded && (
				<div
					id={`memos-for-category-${category.id}`}
					className='p-3 border-t border-gray-200 bg-white'
				>
					{children}
				</div>
			)}
		</div>
	);
};
