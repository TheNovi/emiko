import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { bobImage } from "$lib/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";

// Get full info about file (for ImageDetail)
export const GET: RequestHandler = async ({ locals, params, url }) => {
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

	if (locals.user && !url.searchParams.get("public")) q.where(and(eq(bobImage.userId, locals.user.id), eq(bobImage.id, +params.id), isNull(bobImage.deletedAt)));
	else q.where(and(eq(bobImage.public, true), eq(bobImage.id, +params.id), isNull(bobImage.deletedAt)));

	return json(await q.get());
};
