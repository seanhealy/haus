import type {
	QuickLinkIcon as QuickLinkIconConfig,
	Section,
} from "@/app/types";

export type Suggestion =
	| { kind: "search"; label: string; query: string }
	| { kind: "recent"; label: string; query: string }
	| {
			kind: "link";
			id: string;
			label: string;
			url: string;
			section: string;
			icon?: QuickLinkIconConfig;
	  };

export function buildSuggestions(
	query: string,
	recents: string[],
	sections: Section[],
): Suggestion[] {
	const trimmed = query.trim();
	if (!trimmed) return [];
	const needle = trimmed.toLowerCase();
	const matchesNeedle = (lower: string) => lower.includes(needle);

	const sectionLinks = sections.flatMap((section) =>
		section.links.map((link) => ({ link, section: section.label })),
	);

	const linkMatches: Suggestion[] = sectionLinks
		.filter(({ link }) => matchesNeedle(link.label.toLowerCase()))
		.map(({ link, section }) => ({
			kind: "link",
			id: link.id,
			label: link.label,
			url: link.url,
			section,
			icon: link.icon,
		}));

	const linkLabels = new Set(
		sectionLinks.map(({ link }) => link.label.toLowerCase()),
	);
	const recentMatches: Suggestion[] = recents
		.filter((recent) => {
			const lower = recent.toLowerCase();
			return lower !== needle && !linkLabels.has(lower) && matchesNeedle(lower);
		})
		.map((recent) => ({ kind: "recent", label: recent, query: recent }));

	const searchOption: Suggestion = {
		kind: "search",
		label: `Search for "${trimmed}"`,
		query: trimmed,
	};

	return [searchOption, ...linkMatches, ...recentMatches];
}

export function metaLabel(suggestion: Suggestion): string | null {
	if (suggestion.kind === "recent") return "Recent search";
	if (suggestion.kind === "link") return suggestion.section || "Link";
	return null;
}

export function suggestionKey(suggestion: Suggestion): string {
	return suggestion.kind === "link"
		? `link:${suggestion.id}`
		: `${suggestion.kind}:${suggestion.query}`;
}
