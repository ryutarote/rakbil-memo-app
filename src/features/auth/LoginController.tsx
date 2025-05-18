import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useLoginForm } from './hooks/useLoginForm';

export const LoginController: React.FC = () => {
	const {
		accessTokenValue,
		formState,
		formMethods,
		handleFormSubmit,
		handleAccessTokenChange,
	} = useLoginForm();

	return (
		<LoginForm
			accessTokenValue={accessTokenValue}
			onAccessTokenChange={handleAccessTokenChange}
			onSubmit={formMethods.handleSubmit(handleFormSubmit)}
			isTokenValid={formState.isTokenValid}
			isSubmitting={formState.isSubmitting}
			isSubmitted={formState.isSubmitted}
			errorMessage={formState.errorMessage ?? undefined}
		/>
	);
};
