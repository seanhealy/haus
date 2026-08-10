import { sectionsCookieName } from "../../sectionsCookie";

// Authored readably and inlined via toString(); the production build minifies
// it. Must stay self-contained (no closure refs) and take no interpolated input
// — the cookie name comes from a data attribute — so it's injection-free.
function restoreSections() {
	const script = document.currentScript as HTMLScriptElement | null;
	if (!script) return;

	const prefix = `${script.dataset.sectionsCookie}=`;
	const entry = (document.cookie ? document.cookie.split("; ") : []).find(
		(part) => part.indexOf(prefix) === 0,
	);

	let state: Record<string, boolean> = {};
	if (entry) {
		try {
			const parsed = JSON.parse(decodeURIComponent(entry.slice(prefix.length)));
			if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
				state = parsed;
			}
		} catch {
			state = {};
		}
	}

	for (const section of document.querySelectorAll("details[data-section-id]")) {
		const id = section.getAttribute("data-section-id");
		const saved = id !== null && Object.hasOwn(state, id) ? !!state[id] : true;
		(section as HTMLDetailsElement).open = saved;
	}
}

const RESTORE_SECTIONS = `(${restoreSections.toString()})();`;

export function SectionsRestoreScript({ uuid }: { uuid: string }) {
	return (
		<script
			data-sections-cookie={sectionsCookieName(uuid)}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: static, no interpolation
			dangerouslySetInnerHTML={{ __html: RESTORE_SECTIONS }}
		/>
	);
}
