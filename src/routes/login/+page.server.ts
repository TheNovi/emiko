import { loginUser } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { addError } from '$lib/checks';

export const load = (async (event) => {
	if (event.locals.user) redirect(302, '/'); //TODO url from query
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		let error: string[] = [];
		const data = await event.request.formData();
		const n = data.get('name')?.valueOf();
		const p = data.get('password')?.valueOf();
		if (!n || typeof n !== 'string' || !p || typeof p !== 'string') {
			// console.error('login error', name, password);
			return {
				error: 'All fields are required',
				name: n,
			};
		}
		let name = n.trim();
		let password = p.trim();

		addError(
			error,
			(await loginUser(event, { name, password })) && 'Username or password is incorrect'
		);
		if (error.length == 0) redirect(302, '/'); //TODO url from query
		// console.log(error);
		return {
			error: error.join('\n'),
			name,
		};
	},
};
