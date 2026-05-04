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
});

export const quickLinkSchema = z.object({
	label: z.string().min(1),
	url: safeUrl,
	icon: quickLinkIconSchema.optional(),
});

export const sectionSchema = z.object({
	label: z.string(),
	links: z.array(quickLinkSchema),
});

export const backgroundConfigSchema = z.object({
	image: safeUrl,
});

export const homeConfigSchema = z.object({
	title: z.string().optional(),
	subtitle: z.string().optional(),
	background: backgroundConfigSchema,
	sections: z.array(sectionSchema),
});

export type QuickLinkIcon = z.infer<typeof quickLinkIconSchema>;
export type QuickLink = z.infer<typeof quickLinkSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type BackgroundConfig = z.infer<typeof backgroundConfigSchema>;
export type HomeConfig = z.infer<typeof homeConfigSchema>;
