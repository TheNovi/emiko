import { db } from "$lib/server/db";
import { bobImage } from "$lib/server/db/schema";
import { error, json } from "@sveltejs/kit";
import { and, eq, isNull } from "drizzle-orm";
import * as v from "valibot";
import type { RequestHandler } from "./$types";

const Id = v.pipe(
	v.string(),
	v.transform((id) => +id),
	v.number(),
	v.minValue(1)
);
// Get full info about file (for ImageDetail)
export const GET: RequestHandler = async ({ locals, params, url }) => {
	const id = v.safeParse(Id, params.id);
	if (!id.success) return error(400, "id: " + id.issues.join(", "));
	let q = db
		.select({
			id: bobImage.id,
			// type: bobImage.type,
			takenAt: bobImage.takenAt,
			favorite: bobImage.favorite,
			public: bobImage.public,
			description: bobImage.description,
		})
		.from(bobImage);

	if (locals.user && !url.searchParams.get("public")) q.where(and(eq(bobImage.userId, locals.user.id), eq(bobImage.id, id.output), isNull(bobImage.deletedAt)));
	else q.where(and(eq(bobImage.public, true), eq(bobImage.id, id.output), isNull(bobImage.deletedAt)));

	return json(await q.get());
};
