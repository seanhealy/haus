import { z } from "zod";

export type NavigationTarget = {
	url: string;
	display: string;
};

/**
 * Resolves a query the user typed into a site to navigate to, or null when it
 * reads as a search instead.
 *
 * Detection runs against the raw text rather than a parsed URL on purpose: the
 * URL parser happily rewrites `192.168.1` into `192.168.0.1` and `0x7f.1` into
 * `127.0.0.1`, so parsing first would send people somewhere they never typed.
 * `new URL()` is only used at the end, to normalise a target we already trust.
 */
export function resolveNavigationTarget(
	query: string,
): NavigationTarget | null {
	const trimmed = query.trim();
	if (!trimmed || /\s/.test(trimmed) || trimmed.startsWith("//")) return null;

	// An explicit http(s) prefix is a statement of intent, so it skips the
	// host heuristics below. Any other scheme — javascript:, data:, file: —
	// falls through to search rather than being followed.
	if (HTTP_SCHEME.test(trimmed)) return buildTarget(trimmed);
	if (OTHER_SCHEME.test(trimmed)) return null;

	const host = authorityHost(trimmed);
	if (!host || !navigableHostSchema.safeParse(host).success) return null;

	return buildTarget(`${schemeFor(host)}://${trimmed}`);
}

const HTTP_SCHEME = /^https?:\/\//i;

// Any other scheme, either with an authority (`ftp://`) or opaque
// (`javascript:`). The digit guard keeps `localhost:3000` and `10.0.0.5:8080`
// out — a bare host with a port is scheme-shaped but isn't a scheme.
const OTHER_SCHEME = /^[a-z][a-z0-9+.-]*:(?:\/\/|(?!\d))/i;

const ipv4Schema = z.string().ip({ version: "v4" });
const ipv6Schema = z.string().ip({ version: "v6" });

/** An IPv6 literal in the bracketed form a URL requires: `[::1]`. */
const bracketedIpv6Schema = z
	.string()
	.regex(/^\[.+\]$/)
	.transform((host) => host.slice(1, -1).toLowerCase())
	.pipe(ipv6Schema);

/** A dotted hostname whose final label reads like a real TLD. */
const domainSchema = z
	.string()
	.regex(/^[^\s.]+(?:\.[^\s.]+)*\.(?:[a-z]{2,}|xn--[a-z0-9-]+)$/i);

const navigableHostSchema = z.union([
	ipv4Schema,
	bracketedIpv6Schema,
	z.literal("localhost"),
	domainSchema,
]);

const loopbackIpv4Schema = ipv4Schema.refine((host) => host.startsWith("127."));

const privateIpv4Schema = ipv4Schema.refine((host) => {
	const [first, second] = host.split(".").map(Number);
	if (first === 10) return true;
	if (first === 192 && second === 168) return true;
	if (first === 169 && second === 254) return true;
	return first === 172 && second >= 16 && second <= 31;
});

// Loopback (::1), unique local (fc00::/7) and link local (fe80::/10). Matched
// on the prefix rather than expanded, which is enough to pick a scheme.
const localIpv6Schema = bracketedIpv6Schema.refine(
	(host) => host === "::1" || /^f[cd]|^fe[89ab]/.test(host),
);

const localDomainSchema = z
	.string()
	.regex(/\.(?:local|internal|lan|home\.arpa)$/i);

/**
 * Hosts that rarely speak TLS, so they get http. Everything else gets https —
 * the browser's own upgrade and HSTS handle the public stragglers.
 */
const localHostSchema = z.union([
	z.literal("localhost"),
	loopbackIpv4Schema,
	privateIpv4Schema,
	localIpv6Schema,
	localDomainSchema,
]);

function schemeFor(host: string): "http" | "https" {
	return localHostSchema.safeParse(host).success ? "http" : "https";
}

/**
 * The host portion of a schemeless query, with any port stripped. Returns null
 * when the authority carries credentials — `user:pass@evil.com` renders as
 * `evil.com` and is a phishing shape worth refusing.
 */
function authorityHost(input: string): string | null {
	// Backslashes delimit the authority just like slashes do for http(s), so
	// they have to split here too or the parsed host won't be the one we
	// checked.
	const [authority = ""] = input.split(/[/?#\\]/);
	if (!authority || authority.includes("@")) return null;

	if (authority.startsWith("[")) {
		const close = authority.indexOf("]");
		if (close === -1) return null;
		const port = authority.slice(close + 1);
		if (port && !/^:\d+$/.test(port)) return null;
		return authority.slice(0, close + 1).toLowerCase();
	}

	const separator = authority.lastIndexOf(":");
	if (separator === -1) return authority.toLowerCase();
	if (!/^\d+$/.test(authority.slice(separator + 1))) return null;
	return authority.slice(0, separator).toLowerCase();
}

function buildTarget(candidate: string): NavigationTarget | null {
	let url: URL;
	try {
		url = new URL(candidate);
	} catch {
		return null;
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") return null;
	if (url.username || url.password) return null;
	return { url: url.href, display: displayFor(url) };
}

/**
 * https is the assumed default so it stays hidden, while http stays visible —
 * it's a signal the target is local or insecure.
 */
function displayFor(url: URL): string {
	const shown =
		url.protocol === "https:" ? url.href.slice("https://".length) : url.href;
	return shown.endsWith("/") && !url.search && !url.hash
		? shown.slice(0, -1)
		: shown;
}
