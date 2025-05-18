import fetchApi from '@/lib/apiClient';
import type { Result } from '@/lib/result';
import type { AccessToken } from '@/domain/auth/types';
import type { Memo } from '@/types/api';

import type { MemoDetail, UpdateMemoPayload } from '@/types/api';

import type { CreateMemoPayload } from '@/types/api';

export const getMemosByCategory = async (
	token: AccessToken,
	categoryId: number
): Promise<Result<Memo[], Error>> => {
	return fetchApi<Memo[]>(`/memo?category_id=${categoryId}`, {
		accessToken: token,
		method: 'GET',
	});
};

export const getMemoDetail = async (
	token: AccessToken,
	memoId: number
): Promise<Result<MemoDetail, Error>> => {
	return fetchApi<MemoDetail>(`/memo/${memoId}`, {
		accessToken: token,
		method: 'GET',
	});
};

export const createMemo = async (
	token: AccessToken,
	payload: CreateMemoPayload
): Promise<Result<MemoDetail, Error>> => {
	return fetchApi<MemoDetail>('/memo', {
		accessToken: token,
		method: 'POST',
		body: JSON.stringify(payload),
	});
};

export const updateMemo = async (
	token: AccessToken,
	memoId: number,
	payload: UpdateMemoPayload
): Promise<Result<MemoDetail, Error>> => {
	return fetchApi<MemoDetail>(`/memo/${memoId}`, {
		accessToken: token,
		method: 'PUT',
		body: JSON.stringify(payload),
	});
};

export const deleteMemo = async (
	token: AccessToken,
	memoId: number
): Promise<Result<null, Error>> => {
	return fetchApi<null>(`/memo/${memoId}`, {
		accessToken: token,
		method: 'DELETE',
	});
};
