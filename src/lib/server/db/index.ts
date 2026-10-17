import { DB_URL } from "$app/env/private";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({ url: DB_URL ?? "file:deleteMe.db" });
export const db = drizzle(client, { logger: false });
