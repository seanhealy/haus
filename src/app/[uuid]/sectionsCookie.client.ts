import { sectionsCookieName } from "./sectionsCookie";

const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;

export function writeSectionsCookie(
	uuid: string,
	state: Record<string, boolean>,
): Promise<void> {
	return cookieStore.set({
		name: sectionsCookieName(uuid),
		value: encodeURIComponent(JSON.stringify(state)),
		path: `/${uuid}`,
		expires: Date.now() + COOKIE_MAX_AGE_MS,
		sameSite: "lax",
	});
}
