"use server";

import { revalidatePath } from "next/cache";
import { homeConfigSchema } from "@/app/types";
import { HomepageRepository } from "@/db/repositories";
import { isUuid } from "@/utilities/isUuid";

type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveHomepage(
	uuid: string,
	input: unknown,
): Promise<SaveResult> {
	if (!isUuid(uuid)) {
		return { ok: false, error: "Invalid id" };
	}
	const parsed = homeConfigSchema.safeParse(input);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		const path = first.path.join(".");
		return { ok: false, error: `${path}: ${first.message}` };
	}
	await HomepageRepository.update(uuid, parsed.data);
	revalidatePath(`/${uuid}`);
	return { ok: true };
}
