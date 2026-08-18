import { describe, expect, it } from "vitest";
import { isLocalHost, navigableHost } from "./host";

describe("host", () => {
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

	describe("isLocalHost()", () => {
		describe("with a public host", () => {
			it.each(["example.com", "1.2.3.4", "2001:db8::1"])(
				"is false for %s",
				(host) => {
					expect(isLocalHost(host)).toBe(false);
				},
			);
		});

		describe("with localhost", () => {
			it("is true", () => {
				expect(isLocalHost("localhost")).toBe(true);
			});
		});

		describe("with a private or loopback IPv4 address", () => {
			it.each([
				"127.0.0.1",
				"10.1.2.3",
				"172.16.0.1",
				"192.168.1.10",
				"169.254.1.1",
			])("is true for %s", (host) => {
				expect(isLocalHost(host)).toBe(true);
			});
		});

		describe("with an address just outside a private range", () => {
			it("is false", () => {
				expect(isLocalHost("172.32.0.1")).toBe(false);
			});
		});

		describe("with a local IPv6 address", () => {
			it.each(["::1", "fd00::1", "fe80::1"])("is true for %s", (host) => {
				expect(isLocalHost(host)).toBe(true);
			});
		});

		describe("with a local domain suffix", () => {
			it.each(["nas.local", "git.internal", "box.lan", "printer.home.arpa"])(
				"is true for %s",
				(host) => {
					expect(isLocalHost(host)).toBe(true);
				},
			);
		});
	});
});
