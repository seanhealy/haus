import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { assertValue } from "@/utilities/assertValue";
import * as schema from "./schema";

const pool = new Pool({
	connectionString: assertValue(
		process.env.DATABASE_URL,
		"DATABASE_URL is not set",
	),
});

export const db = drizzle(pool, { schema });
