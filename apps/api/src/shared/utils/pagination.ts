const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
	cursor?: string;
	limit?: number;
}

export interface PaginatedResult<TItem> {
	items: TItem[];
	nextCursor: string | null;
}

export function parsePaginationParams(params: PaginationParams): { cursor: string | null; limit: number } {
	const limit = Math.min(Math.max(1, params.limit ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
	const cursor = params.cursor ?? null;
	return { cursor, limit };
}

export function buildPaginatedResult<TItem extends { id: string }>(
	items: TItem[],
	limit: number,
): PaginatedResult<TItem> {
	const hasNextPage = items.length > limit;
	const pageItems = hasNextPage ? items.slice(0, limit) : items;
	const lastItem = pageItems[pageItems.length - 1];
	const nextCursor = hasNextPage && lastItem ? lastItem.id : null;

	return { items: pageItems, nextCursor };
}
