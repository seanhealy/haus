import { describe, expect, it } from "vitest";
import type { HomeConfig } from "@/app/types";
import { describeChanges } from "./changes";

function makeConfig(): HomeConfig {
	return {
		title: "Home",
		background: { image: "https://example.com/bg.png" },
		sections: [
			{
				id: "s1",
				label: "Dev",
				links: [
					{ id: "l1", label: "GitHub", url: "https://github.com" },
					{ id: "l2", label: "MDN", url: "https://mdn.example" },
				],
			},
		],
	};
}

describe("describeChanges()", () => {
	describe("with no differences", () => {
		it("returns nothing", () => {
			expect(describeChanges(makeConfig(), makeConfig())).toEqual([]);
		});
	});

	describe("when the title changes", () => {
		it("reports the new value", () => {
			const after = makeConfig();
			after.title = "Homepage";

			expect(describeChanges(makeConfig(), after)).toEqual([
				{ kind: "changed", description: "Changed the title to “Homepage”" },
			]);
		});
	});

	describe("when a link is added", () => {
		it("names the link and its section", () => {
			const after = makeConfig();
			after.sections[0].links.push({
				id: "l3",
				label: "Docs",
				url: "https://docs.example",
			});

			expect(describeChanges(makeConfig(), after)).toEqual([
				{
					kind: "added",
					description: "Added link “Docs” in section “Dev”",
				},
			]);
		});
	});

	describe("when a link's url changes", () => {
		it("names the field, link, and section", () => {
			const after = makeConfig();
			after.sections[0].links[1].url = "https://developer.mozilla.org";

			expect(describeChanges(makeConfig(), after)).toEqual([
				{
					kind: "changed",
					description:
						"Changed the URL of link “MDN” in section “Dev” to “https://developer.mozilla.org”",
				},
			]);
		});
	});

	describe("when links are reordered", () => {
		it("reads as a move, not a delete and add", () => {
			const after = makeConfig();
			after.sections[0].links.reverse();

			const changes = describeChanges(makeConfig(), after);

			expect(changes.every((change) => change.kind === "moved")).toBe(true);
			expect(changes.length).toBeGreaterThan(0);
		});
	});

	describe("when a whole section is removed", () => {
		it("names the removed section", () => {
			const after = makeConfig();
			after.sections = [];

			expect(describeChanges(makeConfig(), after)).toEqual([
				{ kind: "removed", description: "Removed section “Dev”" },
			]);
		});
	});
});
