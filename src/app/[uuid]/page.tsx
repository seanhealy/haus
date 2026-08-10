import { preload } from "react-dom";
import { HomepageView } from "./components/HomepageView";
import { loadHomepageOr404 } from "./loadHomepage";

type Props = {
	params: Promise<{ uuid: string }>;
};

// Empty array opts the route into on-demand ISR instead of dynamic rendering.
// No revalidate: pages cache until the save action invalidates them on edit.
export async function generateStaticParams() {
	return [];
}

export default async function App({ params }: Props) {
	const { uuid, config } = await loadHomepageOr404(params);

	preload(config.background.image, { as: "image", fetchPriority: "high" });
	return <HomepageView uuid={uuid} config={config} />;
}
