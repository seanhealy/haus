import { index, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
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

export const homepageRevisions = pgTable(
	"homepage_revisions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		homepageId: uuid("homepage_id")
			.notNull()
			.references(() => homepages.id, { onDelete: "cascade" }),
		config: jsonb("config").$type<HomeConfig>().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("homepage_revisions_homepage_created_idx").on(
			table.homepageId,
			table.createdAt,
		),
	],
);
