import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import type { AccessToken } from '@/domain/auth/types';

export function LoginPageClient() {
	const { isLoggedIn, login } = useAuth();

	const [accessTokenValue, setAccessTokenValue] = useState('');
	const [isTokenValid, setIsTokenValid] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined
	);

	const validateToken = (token: string) => {
		// UUID v4 の簡易バリデーション
		const uuidV4Regex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		return uuidV4Regex.test(token);
	};

	const handleAccessTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setAccessTokenValue(value);
		const valid = validateToken(value);
		setIsTokenValid(valid);
		setErrorMessage(valid ? undefined : 'UUID v4形式で入力してください');
		setIsSubmitted(false);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isTokenValid) return;
		setIsSubmitting(true);
		setErrorMessage(undefined);
		try {
			await login(accessTokenValue as AccessToken); // 認証処理
			setIsSubmitted(true);
		} catch (err) {
			setErrorMessage(`${err}: ログインに失敗しました`);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoggedIn) {
		return <p>既にログイン済みです</p>;
	}

	return (
		<div className='w-full max-w-md'>
			<header className='text-center mb-8'>
				<h1 className='text-3xl font-bold text-gray-800'>Memo App</h1>
				<p className='text-sm text-gray-600 mt-1'>
					メモアプリにログインするには、UUID
					v4形式のアクセストークンを入力してください。
					<br />
					このトークンは、アプリケーションの設定やAPIから取得できます。
					<br />
					トークンが必要な場合は、管理者にお問い合わせください。
				</p>
			</header>
			<LoginForm
				accessTokenValue={accessTokenValue}
				onAccessTokenChange={handleAccessTokenChange}
				onSubmit={handleSubmit}
				isTokenValid={isTokenValid}
				isSubmitting={isSubmitting}
				isSubmitted={isSubmitted}
				errorMessage={errorMessage}
			/>
		</div>
	);
}
