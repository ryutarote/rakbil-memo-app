import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

export interface LoginFormInputs {
	accessTokenField: AccessToken;
}

const loginFormSchema = z.object({ accessTokenField: accessTokenSchema });

export function useLoginForm() {
	const {
		login: authLoginContext,
		setIsLoading: setAuthIsLoading,
		isLoading: isAuthLoading,
		isLoggedIn,
	} = useAuth();
	const [isFormSubmitted, setIsFormSubmitted] = useState(false);
	const [submissionError, setSubmissionError] = useState<string | null>(null);

	const {
		handleSubmit,
		formState: { errors, isValid: isFormTokenValid },
		setValue,
		watch,
		control,
	} = useForm<LoginFormInputs>({
		resolver: zodResolver(loginFormSchema),
		mode: 'onChange',
		defaultValues: {
			accessTokenField: '',
		},
	});

	const accessTokenValue = watch('accessTokenField');

	useEffect(() => {
		if (!isLoggedIn && accessTokenValue === '') {
			setValue('accessTokenField', generateUuid() as AccessToken, {
				shouldValidate: true,
			});
		}
	}, [isLoggedIn, setValue, accessTokenValue]);

	const handleFormSubmit = useCallback(
		async (data: LoginFormInputs) => {
			if (!isValidAccessToken(data.accessTokenField)) {
				console.error('Form submitted with invalid token.');
				setSubmissionError('無効なトークン形式です。');
				return;
			}

			setAuthIsLoading(true);
			setSubmissionError(null);
			const token = data.accessTokenField as AccessToken;

			const categoriesResult = await getCategories(token);

			if (categoriesResult.ok) {
				authLoginContext(token);
				setIsFormSubmitted(true);
			} else {
				const errorMessage =
					categoriesResult.error.message || 'ログインに失敗しました。';
				console.error(
					'Login failed or failed to fetch categories:',
					errorMessage
				);
				setSubmissionError(errorMessage);
			}
			setAuthIsLoading(false);
		},
		[authLoginContext, setAuthIsLoading]
	);

	const handleAccessTokenChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setValue('accessTokenField', event.target.value as AccessToken, {
				shouldValidate: true,
			});
		},
		[setValue]
	);

	return {
		control,
		accessTokenValue,
		formMethods: { handleSubmit, setValue, watch },
		formState: {
			errors,
			isTokenValid: isFormTokenValid,
			isSubmitting: isAuthLoading,
			isSubmitted: isFormSubmitted || isLoggedIn,
			errorMessage: errors.accessTokenField?.message || submissionError,
		},
		handleFormSubmit,
		handleAccessTokenChange,
	};
}
