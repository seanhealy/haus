CREATE TABLE "homepage_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"homepage_id" uuid NOT NULL,
	"config" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "homepage_revisions" ADD CONSTRAINT "homepage_revisions_homepage_id_homepages_id_fk" FOREIGN KEY ("homepage_id") REFERENCES "public"."homepages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "homepage_revisions_homepage_created_idx" ON "homepage_revisions" USING btree ("homepage_id","created_at");