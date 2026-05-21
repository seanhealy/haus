import { beforeEach, describe, expect, it } from "vitest";
import { readRecents, recentsStorageKey, rememberSearch } from "./recents";

const storageKey = "test-recents";

beforeEach(() => window.localStorage.clear());

describe("recents", () => {
	describe("recentsStorageKey()", () => {
		it("scopes the key to the uuid", () => {
			expect(recentsStorageKey("abc-123")).toBe("haus:recent-searches:abc-123");
		});
	});

	describe("readRecents()", () => {
		describe("when nothing is stored", () => {
			it("returns an empty list", () => {
				expect(readRecents(storageKey)).toEqual([]);
			});
		});

		describe("when a list of strings is stored", () => {
			it("returns the list", () => {
				window.localStorage.setItem(storageKey, JSON.stringify(["a", "b"]));

				expect(readRecents(storageKey)).toEqual(["a", "b"]);
			});
		});

		describe("when the stored value is not an array", () => {
			it("returns an empty list", () => {
				window.localStorage.setItem(storageKey, JSON.stringify({ a: 1 }));

				expect(readRecents(storageKey)).toEqual([]);
			});
		});

		describe("when the stored value is not valid json", () => {
			it("returns an empty list", () => {
				window.localStorage.setItem(storageKey, "{not json");

				expect(readRecents(storageKey)).toEqual([]);
			});
		});

		describe("when the stored array mixes in non-strings", () => {
			it("keeps only the strings", () => {
				window.localStorage.setItem(
					storageKey,
					JSON.stringify(["a", 1, null, "b"]),
				);

				expect(readRecents(storageKey)).toEqual(["a", "b"]);
			});
		});
	});

	describe("rememberSearch()", () => {
		describe("when adding a new query", () => {
			it("places it first", () => {
				expect(rememberSearch(storageKey, ["old"], "new")).toEqual([
					"new",
					"old",
				]);
			});

			it("persists the list", () => {
				rememberSearch(storageKey, ["old"], "new");

				expect(readRecents(storageKey)).toEqual(["new", "old"]);
			});
		});

		describe("when the query already exists in a different case", () => {
			it("moves it to the front without duplicating", () => {
				expect(rememberSearch(storageKey, ["Cats", "dogs"], "cats")).toEqual([
					"cats",
					"dogs",
				]);
			});
		});

		describe("when the list exceeds the limit", () => {
			it("keeps only the six most recent", () => {
				const existing = ["1", "2", "3", "4", "5", "6"];

				expect(rememberSearch(storageKey, existing, "0")).toEqual([
					"0",
					"1",
					"2",
					"3",
					"4",
					"5",
				]);
			});
		});
	});
});
