import { describe, expect, it } from "vitest";
import { hasScheme, isSupportedScheme, schemeFor, schemeOf } from "./scheme";

describe("scheme", () => {
	describe("hasScheme()", () => {
		describe("with a typed scheme", () => {
			it.each([
				"https://example.com",
				"http://example.com",
				"javascript:alert(1)",
				"mailto:someone@example.com",
				"ftp://example.com",
			])("is true for %s", (query) => {
				expect(hasScheme(query)).toBe(true);
			});
		});

		describe("with a host carrying a port", () => {
			it.each(["localhost:3000", "10.0.0.5:8080"])(
				"is false for %s",
				(query) => {
					expect(hasScheme(query)).toBe(false);
				},
			);
		});

		describe("with a bare domain", () => {
			it("is false", () => {
				expect(hasScheme("example.com")).toBe(false);
			});
		});
	});

	describe("isSupportedScheme()", () => {
		describe("with an http(s) scheme", () => {
			it.each(["https://example.com", "HTTP://example.com"])(
				"is true for %s",
				(query) => {
					expect(isSupportedScheme(query)).toBe(true);
				},
			);
		});

		describe("with any other scheme", () => {
			it.each(["javascript:alert(1)", "file:///etc/passwd"])(
				"is false for %s",
				(query) => {
					expect(isSupportedScheme(query)).toBe(false);
				},
			);
		});
	});

	describe("schemeFor()", () => {
		describe("with a public domain", () => {
			it("chooses https", () => {
				expect(schemeFor("example.com")).toBe("https");
			});
		});

		describe("with a public IP address", () => {
			it("chooses https", () => {
				expect(schemeFor("1.2.3.4")).toBe("https");
			});
		});

		describe("with localhost", () => {
			it("chooses http", () => {
				expect(schemeFor("localhost")).toBe("http");
			});
		});

		describe("with a loopback address", () => {
			it("chooses http", () => {
				expect(schemeFor("127.0.0.1")).toBe("http");
			});
		});

		describe("with a private IPv4 address", () => {
			it.each(["10.1.2.3", "172.16.0.1", "192.168.1.10", "169.254.1.1"])(
				"chooses http for %s",
				(host) => {
					expect(schemeFor(host)).toBe("http");
				},
			);
		});

		describe("with an address just outside a private range", () => {
			it("chooses https", () => {
				expect(schemeFor("172.32.0.1")).toBe("https");
			});
		});

		describe("with a local IPv6 address", () => {
			it.each(["::1", "fd00::1", "fe80::1"])("chooses http for %s", (host) => {
				expect(schemeFor(host)).toBe("http");
			});
		});

		describe("with a public IPv6 address", () => {
			it("chooses https", () => {
				expect(schemeFor("2001:db8::1")).toBe("https");
			});
		});

		describe("with a local domain suffix", () => {
			it.each(["nas.local", "git.internal", "box.lan", "printer.home.arpa"])(
				"chooses http for %s",
				(host) => {
					expect(schemeFor(host)).toBe("http");
				},
			);
		});
	});

	describe("schemeOf()", () => {
		describe("with an https URL", () => {
			it("reads https", () => {
				expect(schemeOf(new URL("https://example.com"))).toBe("https");
			});
		});

		describe("with an http URL", () => {
			it("reads http", () => {
				expect(schemeOf(new URL("http://example.com"))).toBe("http");
			});
		});

		describe("with a URL we do not navigate to", () => {
			it("reads nothing", () => {
				expect(schemeOf(new URL("file:///etc/passwd"))).toBeNull();
			});
		});
	});
});
