import { env } from "$env/dynamic/private";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

if (!env.DB_URL) throw new Error("DB_URL is not set");
const client = createClient({ url: env.DB_URL });
export const db = drizzle(client, { logger: false });
