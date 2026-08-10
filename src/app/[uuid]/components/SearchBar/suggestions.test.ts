import { describe, expect, it } from "vitest";
import type { QuickLink, Section } from "@/app/types";
import { buildSuggestions, metaLabel, suggestionKey } from "./suggestions";

function makeLink(overrides: Partial<QuickLink> = {}): QuickLink {
	return {
		id: "link-1",
		label: "GitHub",
		url: "https://github.com",
		...overrides,
	};
}

function makeSection(overrides: Partial<Section> = {}): Section {
	return { id: "section-1", label: "Dev", links: [], ...overrides };
}

describe("suggestions", () => {
	describe("buildSuggestions()", () => {
		describe("when the query is empty", () => {
			it("returns no suggestions", () => {
				expect(buildSuggestions("", [], [makeSection()])).toEqual([]);
			});
		});

		describe("when the query is only whitespace", () => {
			it("returns no suggestions", () => {
				expect(buildSuggestions("   ", [], [makeSection()])).toEqual([]);
			});
		});

		describe("when the query is provided", () => {
			it("offers the search row last, below any matches", () => {
				const suggestions = buildSuggestions("cats", [], []);
				const last = suggestions[suggestions.length - 1];

				expect(last).toEqual({
					kind: "search",
					label: 'Search for "cats"',
					query: "cats",
				});
			});

			it("orders matches above the search row", () => {
				const sections = [
					makeSection({ links: [makeLink({ label: "GitHub" })] }),
				];
				const kinds = buildSuggestions("git", ["gitlab"], sections).map(
					(suggestion) => suggestion.kind,
				);

				expect(kinds).toEqual(["link", "recent", "search"]);
			});
		});

		describe("with a link whose label matches case-insensitively", () => {
			const sections = [
				makeSection({ links: [makeLink({ label: "GitHub" })] }),
			];

			it("includes the link", () => {
				const links = buildSuggestions("git", [], sections).filter(
					(suggestion) => suggestion.kind === "link",
				);

				expect(links).toHaveLength(1);
			});

			it("carries the link's section", () => {
				const [link] = buildSuggestions("git", [], sections).filter(
					(suggestion) => suggestion.kind === "link",
				);

				expect(link).toMatchObject({ section: "Dev" });
			});

			it("carries the link's id", () => {
				const [link] = buildSuggestions("git", [], sections).filter(
					(suggestion) => suggestion.kind === "link",
				);

				expect(link).toMatchObject({ id: "link-1" });
			});
		});

		describe("with a link whose label does not match", () => {
			it("excludes the link", () => {
				const sections = [
					makeSection({ links: [makeLink({ label: "GitHub" })] }),
				];
				const links = buildSuggestions("docs", [], sections).filter(
					(suggestion) => suggestion.kind === "link",
				);

				expect(links).toHaveLength(0);
			});
		});

		describe("with a matching recent search", () => {
			it("includes it as a recent", () => {
				const recents = buildSuggestions("cat", ["cat food"], []).filter(
					(suggestion) => suggestion.kind === "recent",
				);

				expect(recents).toEqual([
					{ kind: "recent", label: "cat food", query: "cat food" },
				]);
			});
		});

		describe("when a recent equals the current query", () => {
			it("drops the recent in favour of the search row", () => {
				const recents = buildSuggestions("cats", ["cats"], []).filter(
					(suggestion) => suggestion.kind === "recent",
				);

				expect(recents).toEqual([]);
			});
		});

		describe("when a recent duplicates a link label", () => {
			it("drops the recent in favour of the link", () => {
				const sections = [
					makeSection({ links: [makeLink({ label: "GitHub" })] }),
				];
				const recents = buildSuggestions("git", ["GitHub"], sections).filter(
					(suggestion) => suggestion.kind === "recent",
				);

				expect(recents).toEqual([]);
			});
		});
	});

	describe("metaLabel()", () => {
		describe("with a recent", () => {
			it("reads 'Recent search'", () => {
				expect(
					metaLabel({ kind: "recent", label: "cats", query: "cats" }),
				).toBe("Recent search");
			});
		});

		describe("with a link in a named section", () => {
			it("reads the section name", () => {
				expect(
					metaLabel({
						kind: "link",
						id: "link-1",
						label: "GitHub",
						url: "https://github.com",
						section: "Dev",
					}),
				).toBe("Dev");
			});
		});

		describe("with a link in an unnamed section", () => {
			it("falls back to 'Link'", () => {
				expect(
					metaLabel({
						kind: "link",
						id: "link-1",
						label: "GitHub",
						url: "https://github.com",
						section: "",
					}),
				).toBe("Link");
			});
		});

		describe("with the search row", () => {
			it("has no kicker", () => {
				expect(
					metaLabel({ kind: "search", label: "x", query: "x" }),
				).toBeNull();
			});
		});
	});

	describe("suggestionKey()", () => {
		describe("with two links sharing a url", () => {
			it("keys them apart by id", () => {
				const base = {
					kind: "link" as const,
					label: "GitHub",
					url: "https://github.com",
					section: "Dev",
				};

				expect(suggestionKey({ ...base, id: "a" })).not.toBe(
					suggestionKey({ ...base, id: "b" }),
				);
			});
		});
	});
});
