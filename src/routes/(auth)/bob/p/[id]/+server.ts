import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bobImage } from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	// if (!locals.user) return error(403, 'No user found');

	let q = db.select({ path: bobImage.path }).from(bobImage);
	if (locals.user && !url.searchParams.get('public'))
		q.where(
			and(
				eq(bobImage.userId, locals.user.id),
				eq(bobImage.id, +params.id),
				isNull(bobImage.deletedAt)
			)
		);
	else
		q.where(
			and(eq(bobImage.public, true), eq(bobImage.id, +params.id), isNull(bobImage.deletedAt))
		);
	let p = await q.get();
	if (!p || !p.path) return error(404, 'Image not found');
	// let f = readFileSync('data/bob/org/' +p.path);
	let f = readFileSync('data/bob/resized/P-' + p.path);

	return new Response(f, { status: 200, headers: {} }); //TODO Headers?
};
