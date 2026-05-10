export function sectionsCookieName(uuid: string): string {
	return `haus-sections-${uuid}`;
}

export function parseSectionsCookie(
	raw: string | undefined,
): Record<string, boolean> {
	if (!raw) return {};
	try {
		const parsed = JSON.parse(decodeURIComponent(raw));
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return {};
		}
		return Object.fromEntries(
			Object.entries(parsed).map(([key, value]) => [key, Boolean(value)]),
		);
	} catch {
		return {};
	}
}
