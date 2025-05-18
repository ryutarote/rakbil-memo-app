import React from 'react';

interface LoginFormProps {
	accessTokenValue: string;
	onAccessTokenChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	isTokenValid: boolean;
	isSubmitting: boolean;
	isSubmitted: boolean;
	errorMessage?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
	accessTokenValue,
	onAccessTokenChange,
	onSubmit,
	isTokenValid,
	isSubmitting,
	isSubmitted,
	errorMessage,
}) => {
	const isDisabled = isSubmitting || isSubmitted;

	return (
		<form
			onSubmit={onSubmit}
			className='space-y-6 p-6 bg-white shadow-lg rounded-xl'
		>
			<div>
				<label
					htmlFor='access_token'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					アクセストークン (UUID v4形式)
				</label>
				<input
					id='access_token'
					type='text'
					value={accessTokenValue}
					onChange={onAccessTokenChange}
					className={`w-full px-3 py-2 border rounded-md shadow-sm
            ${
							errorMessage && !isTokenValid
								? 'border-red-500 focus:ring-red-500 focus:border-red-500'
								: 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
						}
            ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
					disabled={isDisabled}
					aria-describedby='accessTokenError'
					aria-invalid={!isTokenValid && !!errorMessage}
				/>
				{errorMessage && !isTokenValid && (
					<p id='accessTokenError' className='mt-1 text-xs text-red-600'>
						{errorMessage === 'Invalid Access Token format (must be UUID v4)'
							? 'アクセストークンの形式が正しくありません (UUID v4形式である必要があります)。'
							: errorMessage}
					</p>
				)}
			</div>
			<button
				id='login'
				type='submit'
				disabled={!isTokenValid || isDisabled}
				className={`w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
          ${
						!isTokenValid || isDisabled
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
					}`}
			>
				{isSubmitting ? 'ログイン中...' : 'ログイン'}
			</button>
			{isSubmitted && !isSubmitting && (
				<p className='text-sm text-green-600 mt-2 text-center'>
					ログインしました。データを読み込んでいます...
				</p>
			)}
		</form>
	);
};
