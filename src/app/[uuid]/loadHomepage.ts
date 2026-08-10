import { notFound } from "next/navigation";
import type { HomeConfig } from "@/app/types";
import { HomepageRepository } from "@/db/repositories";
import { isUuid } from "@/utilities/isUuid";

// Shared by the view and edit routes: validate the id and load the config,
// rendering the 404 page if either fails.
export async function loadHomepageOr404(
	params: Promise<{ uuid: string }>,
): Promise<{ uuid: string; config: HomeConfig; modifiedAt: Date }> {
	const { uuid } = await params;
	if (!isUuid(uuid)) notFound();

	const homepage = await HomepageRepository.findById(uuid);
	if (!homepage) notFound();

	return { uuid, config: homepage.config, modifiedAt: homepage.modifiedAt };
}
