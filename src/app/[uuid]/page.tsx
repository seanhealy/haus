import { preload } from "react-dom";
import { HomepageView } from "./components/HomepageView";
import { loadHomepageOr404 } from "./loadHomepage";

type Props = {
	params: Promise<{ uuid: string }>;
};

// Each homepage is prerendered and cached (ISR); the save action revalidates
// its path on edit. A time-based backstop catches any change that bypasses it.
export const revalidate = 3600;

// Prerender nothing at build (ids aren't known then); the empty array opts each
// homepage into on-demand static generation, cached and reused after first hit.
export async function generateStaticParams() {
	return [];
}

export default async function App({ params }: Props) {
	const { uuid, config } = await loadHomepageOr404(params);

	preload(config.background.image, { as: "image", fetchPriority: "high" });
	return <HomepageView uuid={uuid} config={config} />;
}
