import config from "@/config/home.json";
import { Homepage } from "./components/Homepage";
import type { HomeConfig } from "./types";

export default function Home() {
	return <Homepage config={config as HomeConfig} />;
}
