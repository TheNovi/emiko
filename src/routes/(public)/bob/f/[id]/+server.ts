import { building } from "$app/environment";
import { env } from "$env/dynamic/private";
import { db } from "$lib/server/db";
import { bobImage } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { and, eq, isNull } from "drizzle-orm";
import { readFileSync } from "fs";
import path from "path";
import * as v from "valibot";
import type { RequestHandler } from "./$types";
if (!building && !env.DATA_PATH) throw new Error("DATA_PATH is not set");

const Id = v.pipe(
	v.string(),
	v.transform((id) => +id),
	v.number(),
	v.minValue(1)
);
// Get file file :)
export const GET: RequestHandler = async ({ locals, params, url }) => {
	const id = v.safeParse(Id, params.id);
	if (!id.success) return error(400, "id: " + id.issues.join(", "));
	let q = db.select({ path: bobImage.path }).from(bobImage);
	if (locals.user && !url.searchParams.get("public")) q.where(and(eq(bobImage.userId, locals.user.id), eq(bobImage.id, id.output), isNull(bobImage.deletedAt)));
	else q.where(and(eq(bobImage.public, true), eq(bobImage.id, id.output), isNull(bobImage.deletedAt)));
	let p = await q.get();

	if (!p || !p.path) return error(404, "Image not found");
	let f = readFileSync(path.join(env.DATA_PATH, "bob", "resized", "P-" + path.basename(p.path))); //TODO Test ../

	return new Response(f, { status: 200, headers: {} }); //TODO Headers?
};
