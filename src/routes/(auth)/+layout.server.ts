import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
	const user = event.locals.user;
	if (!user) redirect(302, '/login');

	return { user };
}) satisfies LayoutServerLoad;
