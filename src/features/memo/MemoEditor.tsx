import React from 'react';

interface MemoEditorProps {
	title: string;
	content: string;
	onTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onContentChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onSave: () => void;
	isSavable: boolean;
	isSaving: boolean;
	isDisabled: boolean;
}

export const MemoEditor: React.FC<MemoEditorProps> = ({
	title,
	content,
	onTitleChange,
	onContentChange,
	onSave,
	isSavable,
	isSaving,
	isDisabled,
}) => {
	return (
		<div
			className={`space-y-4 ${
				isDisabled ? 'opacity-50 cursor-not-allowed' : ''
			}`}
		>
			<div>
				<label
					htmlFor='memo-title'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					タイトル
				</label>
				<input
					type='text'
					id='memo-title'
					value={title}
					onChange={onTitleChange}
					disabled={isDisabled || isSaving}
					className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
					placeholder='メモのタイトルを入力'
				/>
			</div>
			<div>
				<label
					htmlFor='memo-content'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					内容
				</label>
				<textarea
					id='memo-content'
					rows={10}
					value={content}
					onChange={onContentChange}
					disabled={isDisabled || isSaving}
					className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
					placeholder='メモの内容を入力'
				/>
			</div>
			<div>
				<button
					id='save-memo'
					type='button'
					onClick={onSave}
					disabled={!isSavable || isSaving || isDisabled}
					className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${
							!isSavable || isSaving || isDisabled
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
						}`}
				>
					{isSaving ? '保存中...' : '保存'}
				</button>
			</div>
		</div>
	);
};
