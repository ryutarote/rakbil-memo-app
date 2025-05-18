import React from 'react';

interface DeleteMemoButtonProps {
	onClick: () => void;
	isDisabled: boolean;
}

export const DeleteMemoButton: React.FC<DeleteMemoButtonProps> = ({
	onClick,
	isDisabled,
}) => {
	return (
		<button
			id='delete-memo' // 課題で指定されたID
			type='button'
			onClick={onClick}
			disabled={isDisabled}
			className={`px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white
        ${
					isDisabled
						? 'bg-gray-300 cursor-not-allowed'
						: 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
				}`}
			title={
				isDisabled ? '削除するメモが選択されていません' : '選択中のメモを削除'
			}
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				className='h-4 w-4 inline-block mr-1 align-text-bottom'
				viewBox='0 0 20 20'
				fill='currentColor'
			>
				<path
					fillRule='evenodd'
					d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
					clipRule='evenodd'
				/>
			</svg>
			削除
		</button>
	);
};
