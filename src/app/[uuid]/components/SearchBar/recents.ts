const RECENTS_LIMIT = 6;

export function recentsStorageKey(uuid: string): string {
	return `haus:recent-searches:${uuid}`;
}

export function readRecents(storageKey: string): string[] {
	try {
		const raw = window.localStorage.getItem(storageKey);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((entry): entry is string => typeof entry === "string");
	} catch {
		return [];
	}
}

export function rememberSearch(
	storageKey: string,
	recents: string[],
	query: string,
): string[] {
	const seen = new Set<string>();
	const next = [query, ...recents]
		.filter((entry) => {
			const key = entry.toLowerCase();
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.slice(0, RECENTS_LIMIT);
	try {
		window.localStorage.setItem(storageKey, JSON.stringify(next));
	} catch {
		// Storage may be unavailable (private mode, quota); recents are
		// best-effort and the search still works without them.
	}
	return next;
}
