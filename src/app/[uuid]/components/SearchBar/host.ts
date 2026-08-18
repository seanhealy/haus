import { z } from "zod";

/** The host a schemeless query points at, if it is one we'll navigate to. */
export function navigableHost(query: string): string | undefined {
	const host = navigableHostSchema.safeParse(query);
	return host.success ? host.data : undefined;
}

/** Loopback, private ranges, and the domain suffixes reserved for local use. */
export function isLocalHost(host: string): boolean {
	return localHostSchema.safeParse(host).success;
}

/**
 * Backslashes delimit the authority just as slashes do, so they split here too
 * — otherwise the host we check isn't the host we'd reach. Credentials are
 * refused outright: `user:pass@evil.com` renders as `evil.com`.
 */
const authoritySchema = z
	.string()
	.transform((query) => query.split(/[/?#\\]/)[0])
	.refine((authority) => !authority.includes("@"));

// An IPv6 host is bracketed, so it can hold the colons a port would delimit.
const HOST_IN_AUTHORITY = /^(\[[^\]]+\]|[^:]*)(?::\d+)?$/;

const hostSchema = authoritySchema
	.transform((authority) => HOST_IN_AUTHORITY.exec(authority)?.[1] ?? "")
	.transform((host) => host.replace(/^\[|\]$/g, "").toLowerCase());

/** A dotted hostname whose final label reads like a real TLD. */
const domainSchema = z
	.string()
	.regex(/^[^\s.]+(?:\.[^\s.]+)*\.(?:[a-z]{2,}|xn--[a-z0-9-]+)$/i);

const navigableHostSchema = hostSchema.pipe(
	z.union([
		z.string().ip({ version: "v4" }),
		z.string().ip({ version: "v6" }),
		z.literal("localhost"),
		domainSchema,
	]),
);

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
