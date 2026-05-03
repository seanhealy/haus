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

export const QuickLinkIconSchema = z.object({
	scale: z.number().positive().optional(),
	backgroundColor: z.string().optional(),
});

export const QuickLinkSchema = z.object({
	label: z.string().min(1),
	url: safeUrl,
	icon: QuickLinkIconSchema.optional(),
});

export const BackgroundConfigSchema = z.object({
	image: safeUrl,
});

export const HomeConfigSchema = z.object({
	background: BackgroundConfigSchema,
	quickLinks: z.array(QuickLinkSchema),
});

export type QuickLinkIcon = z.infer<typeof QuickLinkIconSchema>;
export type QuickLink = z.infer<typeof QuickLinkSchema>;
export type BackgroundConfig = z.infer<typeof BackgroundConfigSchema>;
export type HomeConfig = z.infer<typeof HomeConfigSchema>;
