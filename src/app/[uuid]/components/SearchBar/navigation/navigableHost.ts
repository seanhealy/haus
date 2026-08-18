import { z } from "zod";

/** The host a schemeless query points at, if it is one we'll navigate to. */
export function navigableHost(query: string): string | undefined {
	const host = navigableHostSchema.safeParse(query);
	return host.success ? host.data : undefined;
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
