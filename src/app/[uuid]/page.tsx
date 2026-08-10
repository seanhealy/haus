import { preload } from "react-dom";
import { HomepageView } from "./components/HomepageView";
import { loadHomepageOr404 } from "./loadHomepage";

type Props = {
	params: Promise<{ uuid: string }>;
};

export const revalidate = 3600;

// Empty array opts the route into on-demand ISR; ids aren't known at build.
export async function generateStaticParams() {
	return [];
}

export default async function App({ params }: Props) {
	const { uuid, config } = await loadHomepageOr404(params);

	preload(config.background.image, { as: "image", fetchPriority: "high" });
	return <HomepageView uuid={uuid} config={config} />;
}
