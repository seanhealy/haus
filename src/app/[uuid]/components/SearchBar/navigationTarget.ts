import { z } from "zod";
import {
	hasScheme,
	isSupportedScheme,
	type Scheme,
	schemeFor,
	schemeOf,
} from "./scheme";

export type NavigationTarget = {
	url: string;
	display: string;
	scheme: Scheme;
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
	if (!trimmed || /\s/.test(trimmed) || trimmed.startsWith("//")) return null;

	// A typed scheme is a statement of intent; only http(s) is ours to follow.
	if (hasScheme(trimmed)) {
		return isSupportedScheme(trimmed) ? targetFrom(trimmed) : null;
	}

	const host = navigableHost(trimmed);
	return host ? targetFrom(`${schemeFor(host)}://${trimmed}`) : null;
}

/** The host a schemeless query points at, if it is one we'll navigate to. */
function navigableHost(query: string): string | null {
	const host = navigableHostSchema.safeParse(query);
	return host.success ? host.data : null;
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

function targetFrom(candidate: string): NavigationTarget | null {
	if (!URL.canParse(candidate)) return null;
	const url = new URL(candidate);
	const scheme = schemeOf(url);
	if (!scheme) return null;
	if (url.username || url.password) return null;
	return { url: url.href, display: displayFor(url), scheme };
}

/** `example.com` rather than `https://example.com/`; the scheme shows separately. */
function displayFor(url: URL): string {
	const shown = url.href.slice(`${url.protocol}//`.length);
	return shown.endsWith("/") && !url.search && !url.hash
		? shown.slice(0, -1)
		: shown;
}
