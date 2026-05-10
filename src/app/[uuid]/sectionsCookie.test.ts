import { describe, expect, it } from "vitest";

import { parseSectionsCookie, sectionsCookieName } from "./sectionsCookie";

function encodeRaw(value: unknown): string {
	return encodeURIComponent(JSON.stringify(value));
}

describe("sectionsCookie", () => {
	describe("sectionsCookieName()", () => {
		it("scopes the cookie name to the uuid", () => {
			expect(sectionsCookieName("abc-123")).toBe("haus-sections-abc-123");
		});
	});

	describe("parseSectionsCookie()", () => {
		describe("when given undefined", () => {
			it("returns an empty object", () => {
				expect(parseSectionsCookie(undefined)).toEqual({});
			});
		});

		describe("when given an empty string", () => {
			it("returns an empty object", () => {
				expect(parseSectionsCookie("")).toEqual({});
			});
		});

		describe("when the value contains invalid percent-encoding", () => {
			it("returns an empty object", () => {
				expect(parseSectionsCookie("%")).toEqual({});
			});
		});

		describe("when the value decodes to malformed JSON", () => {
			it("returns an empty object", () => {
				expect(parseSectionsCookie(encodeURIComponent("not-json"))).toEqual({});
			});
		});

		describe("when the value decodes to a JSON array", () => {
			it("returns an empty object", () => {
				expect(parseSectionsCookie(encodeRaw([true, false]))).toEqual({});
			});
		});

		describe("when the value decodes to JSON null", () => {
			it("returns an empty object", () => {
				expect(parseSectionsCookie(encodeRaw(null))).toEqual({});
			});
		});

		describe("when the value decodes to a JSON primitive", () => {
			it("returns an empty object", () => {
				expect(parseSectionsCookie(encodeRaw("hello"))).toEqual({});
			});
		});

		describe("when the value decodes to an object of booleans", () => {
			it("returns the booleans by their keys", () => {
				const raw = encodeRaw({ alpha: true, beta: false });
				expect(parseSectionsCookie(raw)).toEqual({ alpha: true, beta: false });
			});
		});

		describe("when an object value is truthy but not a boolean", () => {
			it("coerces it to true", () => {
				const raw = encodeRaw({ alpha: "yes" });
				expect(parseSectionsCookie(raw)).toEqual({ alpha: true });
			});
		});

		describe("when an object value is falsy but not a boolean", () => {
			it("coerces it to false", () => {
				const raw = encodeRaw({ alpha: 0 });
				expect(parseSectionsCookie(raw)).toEqual({ alpha: false });
			});
		});
	});
});
