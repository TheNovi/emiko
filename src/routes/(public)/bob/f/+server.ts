import { db } from '$lib/server/db';
import { bobImage } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	// await new Promise((resolve) => { setTimeout(resolve, 2000); });
	let offset = +(url.searchParams.get('offset') || 0);
	let limit = Math.min(+(url.searchParams.get('limit') || 0), 20);
	if (limit < 0) limit = 0;

	let q = db
		.select({
			id: bobImage.id,
			favorite: bobImage.favorite,
			public: bobImage.public,
		})
		.from(bobImage)
		.offset(offset)
		.limit(limit || 1)
		.orderBy(bobImage.takenAt, bobImage.createdAt);

	if (locals.user && !url.searchParams.get('public'))
		q.where(and(eq(bobImage.userId, locals.user.id), isNull(bobImage.deletedAt)));
	else q.where(and(eq(bobImage.public, true), isNull(bobImage.deletedAt)));

	return json(await q);
};
