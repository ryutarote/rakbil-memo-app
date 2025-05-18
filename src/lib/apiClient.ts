import { Result, ok, err } from './result';
import type { AccessToken } from '@/domain/auth/types';

const API_BASE_URL = 'https://challenge-server.tracks.run/memoapp';

interface FetchOptions extends RequestInit {
	accessToken?: AccessToken;
}

async function fetchApi<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<Result<T, Error>> {
	const { accessToken, ...fetchOptions } = options;
	const headers = new Headers(fetchOptions.headers || {});
	headers.set('Content-Type', 'application/json');

	if (accessToken) {
		headers.set('X-ACCESS-TOKEN', accessToken);
	} else {
		// トークンなしの場合のAPI仕様は404だが、ここでは呼び出し側がトークンの有無を制御すると仮定。
		// もしトークンが必須のAPIにトークンなしで呼び出そうとしたらエラーにするなどの事前チェックも可能。
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
