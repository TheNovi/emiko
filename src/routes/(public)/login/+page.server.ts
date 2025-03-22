import { AuthError, loginUser } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { addError } from "$lib/checks";
import * as v from "valibot";

export const load = (async (event) => {
	if (event.locals.user) redirect(303, "/"); //TODO url from query
}) satisfies PageServerLoad;

const sField = v.pipe(v.string(AuthError.MISSING), v.trim(), v.nonEmpty(AuthError.MISSING));
const s = v.object({
	name: v.pipe(sField, v.minLength(3, AuthError.USER_NOT_EXISTS), v.maxLength(25, AuthError.USER_NOT_EXISTS)),
	password: v.pipe(sField, v.minLength(3, AuthError.WRONG_PASSWORD), v.maxLength(250, AuthError.WRONG_PASSWORD)),
});

export const actions: Actions = {
	default: async (event) => {
		let errors: string[] = [];
		const data = Object.fromEntries(await event.request.formData());
		const o = v.safeParse(s, {
			name: data.name,
			password: data.password,
		});

		if (!o.success) {
			return { errors: [o.issues[0].message], name: data.name };
		}
		const { name, password } = o.output;

		addError(
			errors,
			// (await loginUser(event, { name, password })) && "Username or password is incorrect"
			await loginUser(event, { name, password })
		);
		// console.log(errors);
		if (errors.length == 0) redirect(302, "/"); //TODO url from query
		return {
			errors,
			name,
		};
	},
};
