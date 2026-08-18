import { describe, expect, it } from "vitest";
import { isLocalHost } from "./isLocalHost";

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
