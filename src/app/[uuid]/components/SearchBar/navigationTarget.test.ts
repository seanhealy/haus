import { describe, expect, it } from "vitest";
import { resolveNavigationTarget } from "./navigationTarget";

function urlFor(query: string): string | null {
	return resolveNavigationTarget(query)?.url ?? null;
}

describe("navigationTarget", () => {
	describe("resolveNavigationTarget()", () => {
		describe("with an empty query", () => {
			it("resolves nothing", () => {
				expect(resolveNavigationTarget("   ")).toBeNull();
			});
		});

		describe("with an explicit https URL", () => {
			it("navigates to it", () => {
				expect(urlFor("https://example.com/path")).toBe(
					"https://example.com/path",
				);
			});
		});

		describe("with an explicit http URL", () => {
			it("keeps http rather than upgrading it", () => {
				expect(urlFor("http://example.com")).toBe("http://example.com/");
			});
		});

		describe("with a scheme other than http(s)", () => {
			it.each([
				"javascript:alert(1)",
				"data:text/html,<script>alert(1)</script>",
				"file:///etc/passwd",
				"mailto:someone@example.com",
				"ftp://example.com",
			])("resolves nothing for %s", (query) => {
				expect(resolveNavigationTarget(query)).toBeNull();
			});
		});

		describe("with a protocol-relative query", () => {
			it("resolves nothing", () => {
				expect(resolveNavigationTarget("//example.com")).toBeNull();
			});
		});

		describe("with credentials in the authority", () => {
			it("resolves nothing", () => {
				expect(resolveNavigationTarget("user:pass@example.com")).toBeNull();
			});
		});

		describe("when the query contains whitespace", () => {
			it("resolves nothing", () => {
				expect(resolveNavigationTarget("example.com is down")).toBeNull();
			});
		});

		describe("with a bare domain", () => {
			it("navigates over https", () => {
				expect(urlFor("news.ycombinator.com/newest")).toBe(
					"https://news.ycombinator.com/newest",
				);
			});
		});

		describe("with a uppercase domain", () => {
			it("navigates over https", () => {
				expect(urlFor("Example.COM")).toBe("https://example.com/");
			});
		});

		describe("with an internationalised domain", () => {
			it("navigates to the punycoded host", () => {
				expect(urlFor("münchen.de")).toBe("https://xn--mnchen-3ya.de/");
			});
		});

		describe("with a single word", () => {
			it("resolves nothing", () => {
				expect(resolveNavigationTarget("cats")).toBeNull();
			});
		});

		describe("with a word carrying a port", () => {
			it("resolves nothing", () => {
				expect(resolveNavigationTarget("myserver:8080")).toBeNull();
			});
		});

		describe("with a dotted query whose last label is not a TLD", () => {
			it("resolves nothing", () => {
				expect(resolveNavigationTarget("version.2")).toBeNull();
			});
		});

		describe("with a public IPv4 address", () => {
			it("navigates over https", () => {
				expect(urlFor("1.2.3.4")).toBe("https://1.2.3.4/");
			});
		});

		describe("with a private IPv4 address", () => {
			it("navigates over http", () => {
				expect(urlFor("192.168.1.10:8080")).toBe("http://192.168.1.10:8080/");
			});
		});

		describe("with a loopback IPv4 address", () => {
			it("navigates over http", () => {
				expect(urlFor("127.0.0.1:3000")).toBe("http://127.0.0.1:3000/");
			});
		});

		describe("with an incomplete IPv4 address", () => {
			it("resolves nothing rather than expanding it", () => {
				expect(resolveNavigationTarget("192.168.1")).toBeNull();
			});
		});

		describe("with hexadecimal IPv4 octets", () => {
			it("resolves nothing rather than expanding them", () => {
				expect(resolveNavigationTarget("0x7f.1")).toBeNull();
			});
		});

		describe("with an out of range IPv4 octet", () => {
			it("resolves nothing", () => {
				expect(resolveNavigationTarget("999.1.1.1")).toBeNull();
			});
		});

		describe("with a bracketed IPv6 loopback address", () => {
			it("navigates over http", () => {
				expect(urlFor("[::1]:8080")).toBe("http://[::1]:8080/");
			});
		});

		describe("with a bracketed public IPv6 address", () => {
			it("navigates over https", () => {
				expect(urlFor("[2001:db8::1]")).toBe("https://[2001:db8::1]/");
			});
		});

		describe("with a malformed bracketed IPv6 address", () => {
			it("resolves nothing", () => {
				expect(resolveNavigationTarget("[::zz1]")).toBeNull();
			});
		});

		describe("with an unbracketed IPv6 address", () => {
			it("resolves nothing", () => {
				expect(resolveNavigationTarget("2001:db8::1")).toBeNull();
			});
		});

		describe("with localhost", () => {
			it("navigates over http", () => {
				expect(urlFor("localhost:3000/admin")).toBe(
					"http://localhost:3000/admin",
				);
			});
		});

		describe("with a .local host", () => {
			it("navigates over http", () => {
				expect(urlFor("nas.local")).toBe("http://nas.local/");
			});
		});

		describe("with a backslash in place of a path separator", () => {
			it("navigates to the host before the backslash", () => {
				expect(urlFor("example.com\\@evil.com")).toBe(
					"https://example.com/@evil.com",
				);
			});
		});

		describe("display", () => {
			describe("with an https target", () => {
				it("drops the scheme", () => {
					expect(resolveNavigationTarget("example.com")?.display).toBe(
						"example.com",
					);
				});
			});

			describe("with an http target", () => {
				it("drops the scheme", () => {
					expect(resolveNavigationTarget("192.168.1.10:8080")?.display).toBe(
						"192.168.1.10:8080",
					);
				});
			});

			describe("with a path", () => {
				it("keeps the path", () => {
					expect(
						resolveNavigationTarget("news.ycombinator.com/newest")?.display,
					).toBe("news.ycombinator.com/newest");
				});
			});
		});

		describe("scheme", () => {
			describe("with a public host", () => {
				it("reports https", () => {
					expect(resolveNavigationTarget("example.com")?.scheme).toBe("https");
				});
			});

			describe("with a local host", () => {
				it("reports http", () => {
					expect(resolveNavigationTarget("localhost:3000")?.scheme).toBe(
						"http",
					);
				});
			});

			describe("with an explicitly insecure URL", () => {
				it("reports http", () => {
					expect(resolveNavigationTarget("http://example.com")?.scheme).toBe(
						"http",
					);
				});
			});
		});
	});
});
