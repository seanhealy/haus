import { HomepageEditor } from "../components/HomepageEditor";
import { loadHomepageOr404 } from "../loadHomepage";

type Props = {
	params: Promise<{ uuid: string }>;
};

export default async function EditPage({ params }: Props) {
	const { uuid, config } = await loadHomepageOr404(params);
	return <HomepageEditor uuid={uuid} initial={config} />;
}
