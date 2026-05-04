import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	console.error("DATABASE_URL is not set");
	process.exit(1);
}

const sql = neon(databaseUrl);

const config = {
	background: {
		image: "/default-background.jpg",
	},
	sections: [],
};

const rows = await sql`
	INSERT INTO homepages (config)
	VALUES (${JSON.stringify(config)}::jsonb)
	RETURNING id
`;

console.log(`Created https://page.haus/${rows[0].id}`);
