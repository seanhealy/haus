import { describe, expect, it } from "vitest";
import { schemeFor } from "./hostScheme";

describe("hostScheme", () => {
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
});
