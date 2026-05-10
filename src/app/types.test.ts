import { describe, expect, it } from "vitest";

import { quickLinkSchema, searchConfigSchema, sectionSchema } from "./types";

const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("types", () => {
	describe("searchConfigSchema", () => {
		function makeInput(overrides: Record<string, unknown> = {}) {
			return { url: "https://kagi.com/search?q=%s", ...overrides };
		}

		describe("with a valid https URL containing %s", () => {
			it("parses successfully", () => {
				expect(searchConfigSchema.safeParse(makeInput()).success).toBe(true);
			});
		});

		describe("with a valid http URL containing %s", () => {
			it("parses successfully", () => {
				const input = makeInput({ url: "http://example.com/?q=%s" });
				expect(searchConfigSchema.safeParse(input).success).toBe(true);
			});
		});

		describe("when the URL is missing %s", () => {
			it("fails validation", () => {
				const input = makeInput({ url: "https://kagi.com/search?q=test" });
				expect(searchConfigSchema.safeParse(input).success).toBe(false);
			});
		});

		describe("when the URL uses a non-http(s) protocol", () => {
			it("fails validation", () => {
				const input = makeInput({ url: "ftp://example.com/?q=%s" });
				expect(searchConfigSchema.safeParse(input).success).toBe(false);
			});
		});

		describe("when the URL is malformed", () => {
			it("fails validation", () => {
				const input = makeInput({ url: "not a url with %s" });
				expect(searchConfigSchema.safeParse(input).success).toBe(false);
			});
		});

		describe("with a placeholder", () => {
			it("parses successfully", () => {
				const input = makeInput({ placeholder: "Search Kagi" });
				expect(searchConfigSchema.safeParse(input).success).toBe(true);
			});
		});
	});

	describe("quickLinkSchema", () => {
		function makeInput(overrides: Record<string, unknown> = {}) {
			return { label: "Test", url: "https://example.com", ...overrides };
		}

		describe("when id is provided", () => {
			it("preserves the id", () => {
				const result = quickLinkSchema.parse(makeInput({ id: "fixed-id" }));
				expect(result.id).toBe("fixed-id");
			});
		});

		describe("when id is missing", () => {
			it("generates a UUID-shaped id", () => {
				const result = quickLinkSchema.parse(makeInput());
				expect(result.id).toMatch(UUID_REGEX);
			});
		});

		describe("when id is an empty string", () => {
			it("generates a UUID-shaped id", () => {
				const result = quickLinkSchema.parse(makeInput({ id: "" }));
				expect(result.id).toMatch(UUID_REGEX);
			});
		});

		describe("when label is empty", () => {
			it("fails validation", () => {
				const input = makeInput({ label: "" });
				expect(quickLinkSchema.safeParse(input).success).toBe(false);
			});
		});

		describe("when url uses a non-http(s) protocol", () => {
			it("fails validation", () => {
				const input = makeInput({ url: "javascript:alert(1)" });
				expect(quickLinkSchema.safeParse(input).success).toBe(false);
			});
		});
	});

	describe("sectionSchema", () => {
		function makeInput(overrides: Record<string, unknown> = {}) {
			return { label: "Section", links: [], ...overrides };
		}

		describe("when id is provided", () => {
			it("preserves the id", () => {
				const result = sectionSchema.parse(makeInput({ id: "fixed-id" }));
				expect(result.id).toBe("fixed-id");
			});
		});

		describe("when id is missing", () => {
			it("generates a UUID-shaped id", () => {
				const result = sectionSchema.parse(makeInput());
				expect(result.id).toMatch(UUID_REGEX);
			});
		});

		describe("when nested links are missing ids", () => {
			it("generates a UUID-shaped id for each link", () => {
				const result = sectionSchema.parse(
					makeInput({
						links: [{ label: "Link", url: "https://example.com" }],
					}),
				);
				expect(result.links[0].id).toMatch(UUID_REGEX);
			});
		});
	});
});
