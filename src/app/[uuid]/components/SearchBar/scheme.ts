import { z } from "zod";

export type Scheme = "http" | "https";

export function hasScheme(query: string): boolean {
	return SCHEME.test(query);
}

export function isSupportedScheme(query: string): boolean {
	return SUPPORTED_SCHEME.test(query);
}

/**
 * Hosts that rarely speak TLS, so they get http. Everything else gets https —
 * HSTS and the browser's own upgrade handle the public stragglers.
 */
export function schemeFor(host: string): Scheme {
	return localHostSchema.safeParse(host).success ? "http" : "https";
}

/** The scheme a parsed URL carries, or null when it isn't one we navigate to. */
export function schemeOf(url: URL): Scheme | null {
	if (url.protocol === "https:") return "https";
	if (url.protocol === "http:") return "http";
	return null;
}

// The digit guard keeps `localhost:3000` and `10.0.0.5:8080` out — a bare host
// with a port is scheme-shaped but isn't a scheme.
const SCHEME = /^[a-z][a-z0-9+.-]*:(?:\/\/|(?!\d))/i;

const SUPPORTED_SCHEME = /^https?:\/\//i;

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

const localHostSchema = z.union([
	z.literal("localhost"),
	localIpv4Schema,
	localIpv6Schema,
	localDomainSchema,
]);
