import { AuthError, loginUser } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { addError } from "$lib/checks";
import * as v from "valibot";

export const load = (async (event) => {
	if (event.locals.user) redirect(303, "/"); //TODO url from query
}) satisfies PageServerLoad;

const Field = v.pipe(v.string(AuthError.MISSING), v.trim(), v.nonEmpty(AuthError.MISSING));

export const actions: Actions = {
	default: async ({ locals, request, cookies }) => {
		if (locals.user) redirect(303, "/"); //TODO url from query
		let errors: string[] = [];
		const o = v.safeParse(
			v.object({
				name: v.pipe(Field, v.minLength(3, AuthError.USER_NOT_EXISTS), v.maxLength(25, AuthError.USER_NOT_EXISTS)),
				password: v.pipe(Field, v.minLength(3, AuthError.WRONG_PASSWORD), v.maxLength(250, AuthError.WRONG_PASSWORD)),
			}),
			Object.fromEntries(await request.formData())
		);

		if (!o.success) {
			return fail(400, { errors: [o.issues[0].message] });
		}
		const { name, password } = o.output;

		addError(
			errors,
			// (await loginUser(event, { name, password })) && "Username or password is incorrect"
			await loginUser(cookies, { name, password })
		);
		// console.log(errors);
		if (errors.length == 0) redirect(302, "/"); //TODO url from query
		return fail(400, {
			errors,
		});
	},
};
