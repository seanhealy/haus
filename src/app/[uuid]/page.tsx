import { cookies } from "next/headers";
import { preload } from "react-dom";
import { HomepageView } from "./components/HomepageView";
import { loadHomepageOr404 } from "./loadHomepage";
import { parseSectionsCookie, sectionsCookieName } from "./sectionsCookie";

type Props = {
	params: Promise<{ uuid: string }>;
};

export default async function App({ params }: Props) {
	const { uuid, config } = await loadHomepageOr404(params);

	preload(config.background.image, { as: "image", fetchPriority: "high" });
	const cookieStore = await cookies();
	const openSections = parseSectionsCookie(
		cookieStore.get(sectionsCookieName(uuid))?.value,
	);
	return (
		<HomepageView uuid={uuid} config={config} openSections={openSections} />
	);
}
