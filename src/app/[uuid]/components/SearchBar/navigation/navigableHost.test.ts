import { describe, expect, it } from "vitest";
import { navigableHost } from "./navigableHost";

describe("navigableHost()", () => {
	describe("with a bare domain", () => {
		it("reads the host", () => {
			expect(navigableHost("example.com")).toBe("example.com");
		});
	});

	describe("with a path, query and fragment", () => {
		it("reads only the host", () => {
			expect(navigableHost("example.com/a?b=c#d")).toBe("example.com");
		});
	});

	describe("with a port", () => {
		it("drops the port", () => {
			expect(navigableHost("example.com:8080")).toBe("example.com");
		});
	});

	describe("with an uppercase host", () => {
		it("lowercases it", () => {
			expect(navigableHost("Example.COM")).toBe("example.com");
		});
	});

	describe("with a bracketed IPv6 address", () => {
		it("unbrackets it", () => {
			expect(navigableHost("[::1]:8080")).toBe("::1");
		});
	});

	describe("with credentials in the authority", () => {
		it("reads nothing", () => {
			expect(navigableHost("user:pass@example.com")).toBeUndefined();
		});
	});

	describe("with a backslash in place of a path separator", () => {
		it("reads the host before the backslash", () => {
			expect(navigableHost("example.com\\@evil.com")).toBe("example.com");
		});
	});

	describe("with a single word", () => {
		it("reads nothing", () => {
			expect(navigableHost("cats")).toBeUndefined();
		});
	});

	describe("with an incomplete IPv4 address", () => {
		it("reads nothing rather than expanding it", () => {
			expect(navigableHost("192.168.1")).toBeUndefined();
		});
	});
});
