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

		describe("when the query reads as a URL", () => {
			const sections = [
				makeSection({ links: [makeLink({ label: "example.com docs" })] }),
			];
			const suggestions = buildSuggestions(
				"example.com",
				["example.com"],
				sections,
			);

			it("leads with the site", () => {
				expect(suggestions[0]).toEqual({
					kind: "url",
					label: "Go to example.com",
					url: "https://example.com/",
					scheme: "https",
				});
			});

			it("offers the search row second", () => {
				expect(suggestions[1]).toMatchObject({ kind: "search" });
			});

			it("keeps the remaining suggestions below", () => {
				expect(
					suggestions.slice(2).map((suggestion) => suggestion.kind),
				).toEqual(["link"]);
			});

			it("offers the search row only once", () => {
				const searches = suggestions.filter(
					(suggestion) => suggestion.kind === "search",
				);

				expect(searches).toHaveLength(1);
			});
		});

		describe("when the query reads as a local address", () => {
			it("leads with the site over http", () => {
				expect(buildSuggestions("192.168.1.10:8080", [], [])[0]).toEqual({
					kind: "url",
					label: "Go to 192.168.1.10:8080",
					url: "http://192.168.1.10:8080/",
					scheme: "http",
				});
			});
		});

		describe("when the query does not read as a URL", () => {
			it("keeps the search row last", () => {
				const sections = [
					makeSection({ links: [makeLink({ label: "GitHub" })] }),
				];
				const kinds = buildSuggestions("git", [], sections).map(
					(suggestion) => suggestion.kind,
				);

				expect(kinds).toEqual(["link", "search"]);
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

		describe("with a secure url row", () => {
			it("reads 'https'", () => {
				expect(
					metaLabel({
						kind: "url",
						label: "Go to example.com",
						url: "https://example.com/",
						scheme: "https",
					}),
				).toBe("https");
			});
		});

		describe("with an insecure url row", () => {
			it("reads 'http'", () => {
				expect(
					metaLabel({
						kind: "url",
						label: "Go to nas.local",
						url: "http://nas.local/",
						scheme: "http",
					}),
				).toBe("http");
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
		describe("with a url row and a link sharing a url", () => {
			it("keys them apart", () => {
				const url = "https://github.com";

				expect(
					suggestionKey({
						kind: "url",
						label: "Go to github.com",
						url,
						scheme: "https",
					}),
				).not.toBe(
					suggestionKey({
						kind: "link",
						id: "link-1",
						label: "GitHub",
						url,
						section: "Dev",
					}),
				);
			});
		});

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
