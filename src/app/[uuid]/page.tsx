import { notFound } from "next/navigation";
import { HomepageRepository } from "@/db/repositories";
import { isUuid } from "@/utilities/isUuid";
import { Homepage } from "./components/Homepage";

type Props = {
	params: Promise<{ uuid: string }>;
};

export default async function App({ params }: Props) {
	const { uuid } = await params;
	if (!isUuid(uuid)) notFound();
	const config = await HomepageRepository.findById(uuid);
	if (!config) notFound();
	return <Homepage uuid={uuid} initial={config} />;
}
