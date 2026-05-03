import { eq } from "drizzle-orm";
import type { HomeConfig } from "@/app/types";
import { db } from "@/db";
import { homepages } from "@/db/schema";

export const HomepageRepository = {
	async findById(id: string): Promise<HomeConfig | null> {
		const [row] = await db
			.select({ config: homepages.config })
			.from(homepages)
			.where(eq(homepages.id, id))
			.limit(1);
		return row?.config ?? null;
	},

	async create(config: HomeConfig): Promise<{ id: string }> {
		const [row] = await db
			.insert(homepages)
			.values({ config })
			.returning({ id: homepages.id });
		return row;
	},

	async update(id: string, config: HomeConfig): Promise<void> {
		await db.update(homepages).set({ config }).where(eq(homepages.id, id));
	},
};
