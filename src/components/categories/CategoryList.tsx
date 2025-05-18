import React from 'react';
import type { Category } from '@/types/api';
import { CategoryItem } from './CategoryItem';

interface CategoryListProps {
	categories: Category[];
	expandedCategoryId: number | null;
	onCategoryToggle: (categoryId: number) => void;
	// renderMemosForCategory は、CategoryItem の children として渡すコンポーネントを生成する関数
	renderMemosForCategory: (categoryId: number) => React.ReactNode;
}

export const CategoryList: React.FC<CategoryListProps> = ({
	categories,
	expandedCategoryId,
	onCategoryToggle,
	renderMemosForCategory,
}) => {
	if (categories.length === 0) {
		return <p className='text-gray-500 italic'>カテゴリがありません。</p>;
	}

	return (
		<div className='space-y-1'>
			{categories.map((category) => (
				<CategoryItem
					key={category.id}
					category={category}
					isExpanded={expandedCategoryId === category.id}
					onToggleClick={() => onCategoryToggle(category.id)}
				>
					{/* 展開されているカテゴリの場合のみ、メモ表示用コンポーネントをレンダリング */}
					{expandedCategoryId === category.id
						? renderMemosForCategory(category.id)
						: null}
				</CategoryItem>
			))}
		</div>
	);
};
