import { z } from "zod";
import { isLocalHost, navigableHost } from "./host";

export type Scheme = "http" | "https";

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
): NavigationTarget | undefined {
	const parsed = querySchema.safeParse(query);
	if (!parsed.success) return undefined;
	const trimmed = parsed.data;

	// A typed scheme is a statement of intent; only http(s) is ours to follow.
	if (TYPED_SCHEME.test(trimmed)) {
		return HTTP_SCHEME.test(trimmed) ? targetFrom(trimmed) : undefined;
	}

	const host = navigableHost(trimmed);
	if (!host) return undefined;

	const scheme = isLocalHost(host) ? "http" : "https";
	return targetFrom(`${scheme}://${trimmed}`);
}

/** Trimmed, and shaped like something worth resolving at all. */
const querySchema = z
	.string()
	.transform((query) => query.trim())
	.refine((query) => /^\S+$/.test(query))
	.refine((query) => !query.startsWith("//"));

// The digit guard keeps `localhost:3000` and `10.0.0.5:8080` out — a bare host
// with a port is scheme-shaped but isn't a scheme.
const TYPED_SCHEME = /^[a-z][a-z0-9+.-]*:(?:\/\/|(?!\d))/i;

const HTTP_SCHEME = /^https?:\/\//i;

function targetFrom(candidate: string): NavigationTarget | undefined {
	if (!URL.canParse(candidate)) return undefined;
	const url = new URL(candidate);
	if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
	if (url.username || url.password) return undefined;
	return {
		url: url.href,
		display: displayFor(url),
		scheme: url.protocol === "https:" ? "https" : "http",
	};
}

/** `example.com` rather than `https://example.com/`; the scheme shows separately. */
function displayFor(url: URL): string {
	const shown = url.href.slice(`${url.protocol}//`.length);
	return shown.endsWith("/") && !url.search && !url.hash
		? shown.slice(0, -1)
		: shown;
}
