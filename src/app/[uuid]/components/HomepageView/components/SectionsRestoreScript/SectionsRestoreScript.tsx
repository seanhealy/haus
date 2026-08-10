import { sectionsCookieName } from "@/app/[uuid]/sectionsCookie";

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

	document
		.querySelectorAll<HTMLDetailsElement>("details[data-section-id]")
		.forEach((section) => {
			const id = section.getAttribute("data-section-id");
			section.open =
				id !== null && Object.hasOwn(state, id) ? !!state[id] : true;
		});
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
