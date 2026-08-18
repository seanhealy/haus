import type {
	QuickLinkIcon as QuickLinkIconConfig,
	Section,
} from "@/app/types";
import { resolveNavigationTarget, type Scheme } from "./navigationTarget";

export type Suggestion =
	| { kind: "url"; label: string; url: string; scheme: Scheme }
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

	const navigation = resolveNavigationTarget(trimmed);
	if (navigation) {
		const urlOption: Suggestion = {
			kind: "url",
			label: `Go to ${navigation.display}`,
			url: navigation.url,
			scheme: navigation.scheme,
		};
		return [urlOption, searchOption, ...linkMatches, ...recentMatches];
	}

	return [...linkMatches, ...recentMatches, searchOption];
}

export function metaLabel(suggestion: Suggestion): string | null {
	if (suggestion.kind === "recent") return "Recent search";
	if (suggestion.kind === "link") return suggestion.section || "Link";
	if (suggestion.kind === "url") return suggestion.scheme;
	return null;
}

export function suggestionKey(suggestion: Suggestion): string {
	if (suggestion.kind === "link") return `link:${suggestion.id}`;
	if (suggestion.kind === "url") return `url:${suggestion.url}`;
	return `${suggestion.kind}:${suggestion.query}`;
}
