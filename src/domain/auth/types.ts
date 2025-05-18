export type Branded<T, B> = T & { _brand: B };
export type AccessToken = Branded<string, 'AccessToken'>;
