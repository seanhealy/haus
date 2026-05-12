import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { HomepageRepository } from "@/db/repositories";
import { isUuid } from "@/utilities/isUuid";
import { Homepage } from "./components/Homepage";
import { parseSectionsCookie, sectionsCookieName } from "./sectionsCookie";

type Props = {
	params: Promise<{ uuid: string }>;
};

export default async function App({ params }: Props) {
	const { uuid } = await params;
	if (!isUuid(uuid)) notFound();

	const config = await HomepageRepository.findById(uuid);

	if (!config) notFound();

	preload(config.background.image, { as: "image", fetchPriority: "high" });
	const cookieStore = await cookies();
	const openSections = parseSectionsCookie(
		cookieStore.get(sectionsCookieName(uuid))?.value,
	);
	return (
		<Homepage uuid={uuid} initial={config} initialOpenSections={openSections} />
	);
}
