import { z } from 'zod';
import type { AccessToken } from './types';

const uuidV4Regex =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const accessTokenSchema = z
	.string()
	.regex(uuidV4Regex, {
		message:
			'アクセストークンの形式が正しくありません (UUID v4形式である必要があります)。',
	})
	.transform((val) => val as AccessToken) as unknown as z.ZodType<AccessToken>;

export const isValidAccessToken = (token: string): token is AccessToken => {
	return accessTokenSchema.safeParse(token).success;
};
