export interface Category {
	id: number;
	name: string;
}

export interface Memo {
	id: number;
	title: string;
}

export interface MemoDetail extends Memo {
	category_id: number;
	content: string;
}

export interface CreateMemoPayload {
	category_id: number;
	title: string;
	content: string;
}

export interface UpdateMemoPayload {
	category_id: number; // API仕様に基づき、更新時にもカテゴリIDが必要
	title: string;
	content: string;
}
