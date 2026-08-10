import { preload } from "react-dom";
import { HomepageView } from "./components/HomepageView";
import { loadHomepageOr404 } from "./loadHomepage";

type Props = {
	params: Promise<{ uuid: string }>;
};

export async function generateStaticParams() {
	return [];
}

export default async function App({ params }: Props) {
	const { uuid, config, modifiedAt } = await loadHomepageOr404(params);

	preload(config.background.image, { as: "image", fetchPriority: "high" });
	return <HomepageView uuid={uuid} config={config} modifiedAt={modifiedAt} />;
}
