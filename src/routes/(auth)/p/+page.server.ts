import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from '$lib/server/auth';

export const load = (async (event) => {
	if (!event.locals.user) redirect(302, '/login');
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) return { error: 'No user' };
		let out: { name?: string; password?: string } = {};
		const data = await event.request.formData();
		const n = data.get('name')?.valueOf();
		const p1 = data.get('newPassword')?.valueOf();
		const p2 = data.get('newPasswordAgain')?.valueOf();
		if (!n || typeof n !== 'string') {
			return {
				error: "Name can't be empty",
				name: event.locals.user.name,
			};
		}
		let name = n.trim();
		if (name.length && name !== event.locals.user.name) {
			const u = await db
				.selectDistinct({ id: user.id })
				.from(user)
				.where(eq(user.name, name))
				.get();
			if (u)
				return {
					error: 'User with this name already exists. id:' + u.id,
					name,
				};
			out['name'] = name;
		}
		if (p1 && typeof p1 === 'string' && p2 && typeof p2 === 'string') {
			const pas1 = p1.trim();
			const pas2 = p2.trim();

			if (pas1 !== pas2)
				return {
					error: 'Passwords are not the same',
					name,
				};
			//TODO Password strengths checks?
			out['password'] = hash(pas1);
		}

		if (out.name || out.password) {
			const u = await db
				.update(user)
				.set(out)
				.where(eq(user.id, event.locals.user.id))
				.returning({ name: user.name })
				.get();
			if (u) event.locals.user.name = u.name;
			//TODO Error
		}
		// console.log(error);
		return {
			name,
		};
	},
};
