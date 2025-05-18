import React from 'react';

interface CreateMemoButtonProps {
	onClick: () => void;
	isDisabled: boolean;
}

export const CreateMemoButton: React.FC<CreateMemoButtonProps> = ({
	onClick,
	isDisabled,
}) => {
	return (
		<button
			id='new-memo'
			type='button'
			onClick={onClick}
			disabled={isDisabled}
			className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
        ${
					isDisabled
						? 'bg-gray-300 cursor-not-allowed'
						: 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
				}`}
			title={isDisabled ? 'カテゴリを展開してメモを追加' : '新規メモ作成'}
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				className='h-5 w-5 inline-block mr-1'
				viewBox='0 0 20 20'
				fill='currentColor'
			>
				<path
					fillRule='evenodd'
					d='M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V4a1 1 0 011-1z'
					clipRule='evenodd'
				/>
			</svg>
			新規メモ
		</button>
	);
};
