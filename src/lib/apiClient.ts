import { Result, ok, err } from './result';
import type { AccessToken } from '@/domain/auth/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface FetchOptions extends RequestInit {
	accessToken?: AccessToken;
	tokenRequired?: boolean;
}

async function fetchApi<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<Result<T, Error>> {
	const { accessToken, tokenRequired, ...fetchOptions } = options;
	const headers = new Headers(fetchOptions.headers || {});
	headers.set('Content-Type', 'application/json');

	// トークン必須のAPIでトークンがない場合に事前エラーチェック
	if (tokenRequired && !accessToken) {
		console.warn(
			`Token is required for endpoint: ${endpoint}, but was not provided.`
		);
		return err(new Error('Access token is required for this request.'));
	}

	if (accessToken) {
		headers.set('X-ACCESS-TOKEN', accessToken);
	}

	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...fetchOptions,
			headers,
		});

		if (!response.ok) {
			let errorMessage = `API Error: ${response.status} ${response.statusText}`;
			// API仕様書に応じたエラーメッセージのカスタマイズ
			if (response.status === 400) errorMessage = 'Bad Request.';
			if (response.status === 403)
				errorMessage = 'Forbidden. Invalid access token format.';
			if (response.status === 404) errorMessage = 'Not Found.';
			if (response.status === 429) errorMessage = 'Too Many Requests.';
			return err(new Error(errorMessage));
		}

		if (
			response.status === 204 ||
			response.headers.get('content-length') === '0'
		) {
			return ok(null as T);
		}

		const data: T = await response.json();
		return ok(data);
	} catch (error) {
		if (error instanceof Error) {
			return err(error);
		}
		return err(new Error('An unknown network error occurred.'));
	}
}

export default fetchApi;
