import { sql } from "drizzle-orm";

import { db } from "@/db";

/**
 * Example repository demonstrating the repository pattern.
 *
 * Each repository encapsulates all database interactions for a
 * specific domain. Replace this with real repositories as you
 * build out your schema.
 */
export const ExampleRepository = {
	/** Verify the database connection is working. */
	async healthCheck(): Promise<{ now: Date }> {
		const result = await db.execute(sql`SELECT NOW() as now`);
		return { now: result.rows[0].now as Date };
	},
};
