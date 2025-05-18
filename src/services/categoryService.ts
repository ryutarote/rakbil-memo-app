import fetchApi from '@/lib/apiClient';
import type { Result } from '@/lib/result';
import type { AccessToken } from '@/domain/auth/types';
import type { Category } from '@/types/api';

export const getCategories = async (
	token: AccessToken
): Promise<Result<Category[], Error>> => {
	return fetchApi<Category[]>('/category', {
		accessToken: token,
		method: 'GET',
	});
};
