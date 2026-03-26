const store = new Map<string, string>()

export function getCache(path: string): string | undefined {
	return store.get(path)
}

export function setCache(path: string, html: string): void {
	store.set(path, html)
}

export function invalidate(path: string): void {
	store.delete(path)
}

export function invalidateAll(): void {
	store.clear()
}
