export interface PaginationParams {
	cursor?: string;
	limit?: number;
}

export interface PaginatedResult<TItem> {
	items: TItem[];
	nextCursor: string | null;
}
