import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoginForm } from '@/components/auth/LoginForm';
import {
	accessTokenSchema,
	isValidAccessToken,
} from '@/domain/auth/validation';
import type { AccessToken } from '@/domain/auth/types';
import { useAuth } from '@/contexts/AuthContext';
import { getCategories } from '@/services/categoryService';

// 提供されたUUID生成関数
function generateUuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
		.split('')
		.map((c) => {
			switch (c) {
				case 'x':
					return ((Math.random() * 16) | 0).toString(16);
				case 'y':
					return (((Math.random() * 4) | 0) + 8).toString(16);
				default:
					return c;
			}
		})
		.join('');
}

interface LoginFormInputs {
	accessTokenField: AccessToken;
}

export const LoginController: React.FC = () => {
	const {
		login: authLoginContext,
		setIsLoading: setAuthIsLoading,
		isLoading: isAuthLoading,
		isLoggedIn,
	} = useAuth();
	const [isFormSubmitted, setIsFormSubmitted] = useState(false); // ログイン成功後のフォーム無効化用

	const {
		handleSubmit,
		formState: { errors, isValid: isFormTokenValid },
		setValue,
		watch,
	} = useForm<LoginFormInputs>({
		resolver: zodResolver(z.object({ accessTokenField: accessTokenSchema })),
		mode: 'onChange', // バリデーションタイミング
		defaultValues: {
			accessTokenField: '',
		},
	});

	const accessTokenValue = watch('accessTokenField');

	// 初期トークン生成
	useEffect(() => {
		// ログインしておらず、かつユーザーがまだ入力していない場合に初期値を設定
		if (!isLoggedIn && accessTokenValue === '') {
			setValue('accessTokenField', generateUuid() as AccessToken, {
				shouldValidate: true,
			});
		}
	}, [isLoggedIn, setValue, accessTokenValue]);

	const handleFormSubmit = useCallback(
		async (data: LoginFormInputs) => {
			if (!isValidAccessToken(data.accessTokenField)) {
				// このケースは resolver でカバーされるはずだが念のため
				console.error('Form submitted with invalid token.');
				return;
			}

			setAuthIsLoading(true); // AuthContext のローディング状態を更新
			const token = data.accessTokenField as AccessToken;

			// サーバーにカテゴリ一覧をリクエスト (ログイン試行)
			const categoriesResult = await getCategories(token);

			if (categoriesResult.ok) {
				authLoginContext(token); // ログイン成功、AuthContextにトークン保存
				setIsFormSubmitted(true); // フォーム送信完了状態
				console.log('Categories fetched:', categoriesResult.value);
			} else {
				// APIエラー時の処理 (例: トークンが無効だった、サーバーエラーなど)
				// ここではエラーメッセージをLoginFormUIに渡すなどの処理は省略し、consoleに出力
				console.error(
					'Login failed or failed to fetch categories:',
					categoriesResult.error.message
				);
				// 必要であれば、ユーザーにフィードバックするエラー状態を管理
			}
			setAuthIsLoading(false);
		},
		[authLoginContext, setAuthIsLoading]
	);

	return (
		<LoginForm
			accessTokenValue={accessTokenValue}
			onAccessTokenChange={(e) =>
				setValue('accessTokenField', e.target.value as AccessToken, {
					shouldValidate: true,
				})
			}
			onSubmit={handleSubmit(handleFormSubmit)}
			isTokenValid={isFormTokenValid}
			isSubmitting={isAuthLoading} // AuthContextのローディング状態を使用
			isSubmitted={isFormSubmitted || isLoggedIn} // フォーム送信後または既にログイン済みならUIを無効化
			errorMessage={errors.accessTokenField?.message}
		/>
	);
};
