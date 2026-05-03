import { notFound } from "next/navigation";
import { Homepage } from "@/app/components/Homepage";
import type { HomeConfigMap } from "@/app/types";
import config from "@/config/home.json";

type Props = {
	params: Promise<{ uuid: string }>;
};

export default async function App({ params }: Props) {
	const { uuid } = await params;
	const pageConfig = (config as HomeConfigMap)[uuid];
	if (!pageConfig) notFound();
	return <Homepage config={pageConfig} />;
}
