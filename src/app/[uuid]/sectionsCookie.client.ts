import { parseSectionsCookie, sectionsCookieName } from "./sectionsCookie";

const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;

export function readSectionsState(uuid: string): Record<string, boolean> {
	const prefix = `${sectionsCookieName(uuid)}=`;
	const entry = document.cookie
		.split("; ")
		.find((part) => part.startsWith(prefix));
	return parseSectionsCookie(entry?.slice(prefix.length));
}

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

// Persist one section's open state without disturbing the others. The cookie
// holds every section's state in one record, so read the current value, update
// the single key, and write the whole thing back.
export async function setSectionOpen(
	uuid: string,
	sectionId: string,
	open: boolean,
): Promise<void> {
	const existing = await cookieStore.get(sectionsCookieName(uuid));
	const state = parseSectionsCookie(existing?.value);
	state[sectionId] = open;
	await writeSectionsCookie(uuid, state);
}
