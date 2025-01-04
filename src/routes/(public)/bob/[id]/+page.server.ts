import { db } from '$lib/server/db';
import { bobImage } from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, params }) => {
	let q = db
		.select({
			// path: bobImage.path,
			id: bobImage.id,
			type: bobImage.type,
			takenAt: bobImage.takenAt,
			favorite: bobImage.favorite,
			public: bobImage.public,
			description: bobImage.description,
			//TODO Dates
		})
		.from(bobImage);
	if (locals.user)
		q.where(
			and(
				eq(bobImage.userId, locals.user.id),
				eq(bobImage.id, +params.id),
				isNull(bobImage.deletedAt)
			)
		);
	else q.where(and(eq(bobImage.id, +params.id), isNull(bobImage.deletedAt)));

	let d = await q.get();
	//Redirect if file is not public and user is not logged in
	//Yes, you can get private files from pbob if user is logged in (not worth it to fix)
	if (d && !d.public && !locals.user) redirect(302, '/login'); //TODO Return query

	return { f: d, user: locals.user };
}) satisfies PageServerLoad;
