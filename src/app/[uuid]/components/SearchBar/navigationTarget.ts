import { z } from "zod";

export type NavigationTarget = {
	url: string;
	display: string;
	scheme: "http" | "https";
};

/**
 * Detection runs against the raw text rather than a parsed URL: the parser
 * rewrites `192.168.1` into `192.168.0.1` and `0x7f.1` into `127.0.0.1`, so
 * parsing first would send people somewhere they never typed. `new URL()` runs
 * only at the end, to normalise a target that already passed the checks.
 */
export function resolveNavigationTarget(
	query: string,
): NavigationTarget | null {
	const trimmed = query.trim();
	if (!candidateSchema.safeParse(trimmed).success) return null;

	// An explicit scheme is a statement of intent, so it skips the host checks.
	if (HTTP_SCHEME.test(trimmed)) return buildTarget(trimmed);
	if (OTHER_SCHEME.test(trimmed)) return null;

	const host = hostSchema.safeParse(trimmed);
	if (!host.success) return null;

	return buildTarget(`${schemeFor(host.data)}://${trimmed}`);
}

/** Non-empty, no whitespace, and not protocol-relative. */
const candidateSchema = z.string().regex(/^(?!\/\/)\S+$/);

const HTTP_SCHEME = /^https?:\/\//i;

// The digit guard keeps `localhost:3000` and `10.0.0.5:8080` out — a bare host
// with a port is scheme-shaped but isn't a scheme.
const OTHER_SCHEME = /^[a-z][a-z0-9+.-]*:(?:\/\/|(?!\d))/i;

/** A dotted hostname whose final label reads like a real TLD. */
const domainSchema = z
	.string()
	.regex(/^[^\s.]+(?:\.[^\s.]+)*\.(?:[a-z]{2,}|xn--[a-z0-9-]+)$/i);

const navigableHostSchema = z.union([
	z.string().ip({ version: "v4" }),
	z.string().ip({ version: "v6" }),
	z.literal("localhost"),
	domainSchema,
]);

// An IPv6 host is bracketed, so it can hold the colons a port would delimit.
const AUTHORITY = /^(\[[^\]]+\]|[^:]*)(?::\d+)?$/;

/**
 * Backslashes delimit the authority just as slashes do, so they split here too
 * — otherwise the host we check isn't the host we'd reach. Credentials are
 * refused outright: `user:pass@evil.com` renders as `evil.com`.
 */
const hostSchema = z
	.string()
	.transform((query) => query.split(/[/?#\\]/)[0])
	.refine((authority) => !authority.includes("@"))
	.transform((authority) => AUTHORITY.exec(authority)?.[1] ?? "")
	.transform((host) => host.replace(/^\[|\]$/g, "").toLowerCase())
	.pipe(navigableHostSchema);

// Loopback, private and link-local ranges. `.ip()` has already guaranteed four
// valid octets, so only the prefix is left to match.
const localIpv4Schema = z
	.string()
	.ip({ version: "v4" })
	.regex(/^(?:10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/);

// Loopback (::1), unique local (fc00::/7) and link local (fe80::/10), matched
// on the prefix rather than expanded.
const localIpv6Schema = z
	.string()
	.ip({ version: "v6" })
	.regex(/^(?:::1$|f[cd]|fe[89ab])/i);

const localDomainSchema = z
	.string()
	.regex(/\.(?:local|internal|lan|home\.arpa)$/i);

/**
 * Hosts that rarely speak TLS, so they get http. Everything else gets https —
 * HSTS and the browser's own upgrade handle the public stragglers.
 */
const localHostSchema = z.union([
	z.literal("localhost"),
	localIpv4Schema,
	localIpv6Schema,
	localDomainSchema,
]);

function schemeFor(host: string): "http" | "https" {
	return localHostSchema.safeParse(host).success ? "http" : "https";
}

function buildTarget(candidate: string): NavigationTarget | null {
	if (!URL.canParse(candidate)) return null;
	const url = new URL(candidate);
	if (url.protocol !== "http:" && url.protocol !== "https:") return null;
	if (url.username || url.password) return null;
	return {
		url: url.href,
		display: displayFor(url),
		scheme: url.protocol === "https:" ? "https" : "http",
	};
}

/** `example.com` rather than `https://example.com/`; the scheme is shown separately. */
function displayFor(url: URL): string {
	const shown = url.href.slice(`${url.protocol}//`.length);
	return shown.endsWith("/") && !url.search && !url.hash
		? shown.slice(0, -1)
		: shown;
}
