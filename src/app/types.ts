import { z } from "zod";

const safeUrl = z
	.string()
	.min(1)
	.refine(
		(value) => {
			if (value.startsWith("//")) return false;
			if (value.startsWith("/")) return true;
			try {
				const protocol = new URL(value).protocol;
				return protocol === "http:" || protocol === "https:";
			} catch {
				return false;
			}
		},
		{ message: "Must be an http(s) URL or a root-relative path" },
	);

export const quickLinkIconSchema = z.object({
	scale: z.number().positive().optional(),
	backgroundColor: z.string().optional(),
	image: safeUrl.optional(),
});

export const quickLinkSchema = z
	.object({
		id: z.string().optional(),
		label: z.string().min(1),
		url: safeUrl,
		icon: quickLinkIconSchema.optional(),
	})
	.transform((link) => ({
		...link,
		id: link.id || crypto.randomUUID(),
	}));

export const sectionSchema = z
	.object({
		id: z.string().optional(),
		label: z.string(),
		links: z.array(quickLinkSchema),
	})
	.transform((section) => ({
		...section,
		id: section.id || crypto.randomUUID(),
	}));

export const backgroundConfigSchema = z.object({
	image: safeUrl,
});

export const searchConfigSchema = z.object({
	url: z
		.string()
		.min(1)
		.refine((value) => value.includes("%s"), {
			message: "Must contain %s where the query goes",
		})
		.refine(
			(value) => {
				try {
					const protocol = new URL(value.replaceAll("%s", "test")).protocol;
					return protocol === "http:" || protocol === "https:";
				} catch {
					return false;
				}
			},
			{ message: "Must be a valid http(s) URL" },
		),
	placeholder: z.string().optional(),
});

export const homeConfigSchema = z.object({
	title: z.string().optional(),
	subtitle: z.string().optional(),
	background: backgroundConfigSchema,
	search: searchConfigSchema.optional(),
	sections: z.array(sectionSchema),
});

export type QuickLinkIcon = z.infer<typeof quickLinkIconSchema>;
export type QuickLink = z.infer<typeof quickLinkSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type BackgroundConfig = z.infer<typeof backgroundConfigSchema>;
export type SearchConfig = z.infer<typeof searchConfigSchema>;
export type HomeConfig = z.infer<typeof homeConfigSchema>;
