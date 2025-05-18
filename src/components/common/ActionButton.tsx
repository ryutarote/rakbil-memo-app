import React from 'react';

interface ActionButtonProps {
	id: string;
	onClick: () => void;
	isDisabled: boolean;
	text: string;
	icon?: React.ReactNode;
	titleEnabled: string;
	titleDisabled: string;
	variant?: 'primary' | 'danger' | 'default';
	size?: 'sm' | 'md';
	className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
	id,
	onClick,
	isDisabled,
	text,
	icon,
	titleEnabled,
	titleDisabled,
	variant = 'default',
	size = 'md',
	className = '',
}) => {
	// ベースとなるTailwindクラス
	const baseClasses =
		'border border-transparent rounded-md shadow-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2';

	// バリアントごとのスタイル
	let variantClasses = '';
	switch (variant) {
		case 'primary':
			variantClasses = isDisabled
				? 'bg-gray-300 cursor-not-allowed'
				: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
			break;
		case 'danger':
			variantClasses = isDisabled
				? 'bg-gray-300 cursor-not-allowed'
				: 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
			break;
		default: // 必要に応じてデフォルトのスタイルを定義
			variantClasses = isDisabled
				? 'bg-gray-300 cursor-not-allowed'
				: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400';
			break;
	}

	// サイズごとのスタイル
	let sizeClasses = '';
	switch (size) {
		case 'sm':
			sizeClasses = 'px-3 py-1.5 text-xs';
			break;
		case 'md':
		default:
			sizeClasses = 'px-4 py-2 text-sm';
			break;
	}

	return (
		<button
			id={id}
			type='button'
			onClick={onClick}
			disabled={isDisabled}
			className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
			title={isDisabled ? titleDisabled : titleEnabled}
		>
			{icon && (
				<span className='inline-block mr-1 align-text-bottom'>{icon}</span>
			)}
			{text}
		</button>
	);
};
