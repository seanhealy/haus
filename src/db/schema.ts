import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import type { HomeConfig } from "@/app/types";

export const homepages = pgTable("homepages", {
	id: uuid("id").primaryKey().defaultRandom(),
	config: jsonb("config").$type<HomeConfig>().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	modifiedAt: timestamp("modified_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
