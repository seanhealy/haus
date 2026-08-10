import { asc, eq } from "drizzle-orm";
import { type HomeConfig, homeConfigSchema } from "@/app/types";
import { db } from "@/db";
import { homepageRevisions, homepages } from "@/db/schema";

export type HomepageRevision = {
	id: string;
	config: HomeConfig;
	createdAt: Date;
};

export const HomepageRepository = {
	async findById(
		id: string,
	): Promise<{ config: HomeConfig; modifiedAt: Date } | null> {
		const [row] = await db
			.select({ config: homepages.config, modifiedAt: homepages.modifiedAt })
			.from(homepages)
			.where(eq(homepages.id, id))
			.limit(1);
		if (!row) return null;
		return {
			config: homeConfigSchema.parse(row.config),
			modifiedAt: row.modifiedAt,
		};
	},

	async create(config: HomeConfig): Promise<{ id: string }> {
		return db.transaction(async (tx) => {
			const [row] = await tx
				.insert(homepages)
				.values({ config })
				.returning({ id: homepages.id });
			await tx.insert(homepageRevisions).values({ homepageId: row.id, config });
			return row;
		});
	},

	async update(id: string, config: HomeConfig): Promise<void> {
		await db.transaction(async (tx) => {
			await tx.update(homepages).set({ config }).where(eq(homepages.id, id));
			await tx.insert(homepageRevisions).values({ homepageId: id, config });
		});
	},

	async listRevisions(id: string): Promise<HomepageRevision[]> {
		const rows = await db
			.select({
				id: homepageRevisions.id,
				config: homepageRevisions.config,
				createdAt: homepageRevisions.createdAt,
			})
			.from(homepageRevisions)
			.where(eq(homepageRevisions.homepageId, id))
			.orderBy(asc(homepageRevisions.createdAt));
		return rows;
	},
};
