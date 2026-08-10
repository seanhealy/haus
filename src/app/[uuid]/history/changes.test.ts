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
						"Changed the url of link “MDN” in section “Dev” to “https://developer.mozilla.org”",
				},
			]);
		});
	});

	describe("when a link's icon size changes", () => {
		it("names the nested icon field", () => {
			const before = makeConfig();
			before.sections[0].links[0].icon = { scale: 1 };
			const after = structuredClone(before);
			after.sections[0].links[0].icon = { scale: 0.7 };

			expect(describeChanges(before, after)).toEqual([
				{
					kind: "changed",
					description:
						"Changed the icon scale of link “GitHub” in section “Dev” to 0.7",
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

	describe("with several structural edits in one save", () => {
		it("attributes each change to the right link despite shifting indices", () => {
			const before: HomeConfig = {
				background: { image: "https://example.com/bg.png" },
				sections: [
					{
						id: "s1",
						label: "Dev",
						links: [
							{ id: "l1", label: "A", url: "https://a.example" },
							{ id: "l2", label: "B", url: "https://b.example" },
							{ id: "l3", label: "C", url: "https://c.example" },
							{ id: "l4", label: "D", url: "https://d.example" },
						],
					},
				],
			};
			const after = structuredClone(before);
			const [, b, c, d] = after.sections[0].links;
			// Remove A and move D to the front.
			after.sections[0].links = [d, b, c];

			const changes = describeChanges(before, after);

			expect(changes).toContainEqual({
				kind: "removed",
				description: "Removed link “A” in section “Dev”",
			});
			expect(changes).toContainEqual({
				kind: "moved",
				description: "Reordered link “D” in section “Dev”",
			});
			expect(changes.some((change) => change.description.includes("“C”"))).toBe(
				false,
			);
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
