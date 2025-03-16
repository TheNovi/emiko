import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bobImage } from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import path from 'path';
if (!env.DATA_PATH) throw new Error('DATA_PATH is not set');

// Get file file :)
export const GET: RequestHandler = async ({ locals, params, url }) => {
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
	let f = readFileSync(path.join(env.DATA_PATH, 'bob', 'resized', 'P-' + path.basename(p.path))); //TODO Test ../

	return new Response(f, { status: 200, headers: {} }); //TODO Headers?
};
