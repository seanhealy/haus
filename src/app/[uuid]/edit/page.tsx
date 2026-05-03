import { notFound } from "next/navigation";
import { HomepageRepository } from "@/db/repositories";
import { isUuid } from "@/utilities/isUuid";
import { HomepageEditor } from "./components/HomepageEditor";

type Props = {
	params: Promise<{ uuid: string }>;
};

export default async function EditPage({ params }: Props) {
	const { uuid } = await params;
	if (!isUuid(uuid)) notFound();
	const config = await HomepageRepository.findById(uuid);
	if (!config) notFound();
	return <HomepageEditor uuid={uuid} initial={config} />;
}
