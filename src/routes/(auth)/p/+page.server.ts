import { hash, logoutUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
}) satisfies PageServerLoad;

export const actions: Actions = {
	logout: async ({ locals, cookies }) => {
		if (locals.user) await logoutUser(cookies);
		locals.user = undefined; //Just to be sure
		return redirect(303, "/");
	},
	edit: async ({ locals, request }) => {
		if (!locals.user) return redirect(303, "/");
		let out: { name?: string; password?: string } = {};
		const o = v.safeParse(
			v.object({
				name: v.pipe(v.string("Name can't be empty"), v.trim(), v.minLength(3, "Name is too short"), v.maxLength(25, "Name is too long")),
				newPassword: v.optional(
					v.pipe(v.string("Password must be string"), v.trim(), v.union([v.literal(""), v.pipe(v.string(), v.minLength(5, "Password is too short"), v.maxLength(250, "Password is too long"))]))
				),
				newPasswordAgain: v.optional(v.pipe(v.string(), v.trim())),
			}),
			Object.fromEntries(await request.formData())
		);

		if (!o.success) {
			return fail(400, { errors: o.issues.map((e) => e.message) });
		}
		const { name, newPassword, newPasswordAgain } = o.output;

		if (name !== locals.user.name) {
			const u = await db.selectDistinct({ id: user.id }).from(user).where(eq(user.name, name)).get();
			if (u) return fail(400, { errors: ["User with this name already exists."] });
			out["name"] = name;
		}
		if (newPassword) {
			if (newPassword !== newPasswordAgain) return fail(400, { errors: ["Passwords are not the same"] });
			out["password"] = hash(newPassword);
		}

		if (out.name || out.password) {
			const u = await db.update(user).set(out).where(eq(user.id, locals.user.id)).returning({ name: user.name }).get();
			if (u) {
				locals.user.name = u.name;
				return {
					success: true,
					// name: u.name,
				};
			}
			//TODO SQL Error
		}
		return {
			errors: ["SQL Error"],
			// name: name,
		};
	},
};
