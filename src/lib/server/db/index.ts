import { building } from "$app/environment";
import { env } from "$env/dynamic/private";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

if (!building && !env.DB_URL) throw new Error("DB_URL is not set");
const client = createClient({ url: building ? "file:deleteMe.db" : env.DB_URL });
export const db = drizzle(client, { logger: false });
