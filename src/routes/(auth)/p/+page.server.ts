import { hash } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
}) satisfies PageServerLoad;

const s = v.object({
	name: v.pipe(v.string("Name can't be empty"), v.trim(), v.minLength(3, "Name is too short"), v.maxLength(25, "Name is too long")),
	// pas1: v.optional(v.union([v.literal(""), v.pipe(v.string("Password must be string"), v.trim(), v.minLength(5, "Password is too short"), v.maxLength(250, "Password is too long"))])),
	pas1: v.optional(
		v.pipe(v.string("Password must be string"), v.trim(), v.union([v.literal(""), v.pipe(v.string(), v.minLength(5, "Password is too short"), v.maxLength(250, "Password is too long"))]))
	),
	pas2: v.optional(v.pipe(v.string(), v.trim())),
});

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) return redirect(303, "/");
		let out: { name?: string; password?: string } = {};
		const data = Object.fromEntries(await event.request.formData());
		const o = v.safeParse(s, {
			name: data.name,
			pas1: data.newPassword,
			pas2: data.newPasswordAgain,
		});

		if (!o.success) {
			return { errors: o.issues.map((e) => e.message), name: data.name };
		}
		const { name, pas1, pas2 } = o.output;

		if (name !== event.locals.user.name) {
			const u = await db.selectDistinct({ id: user.id }).from(user).where(eq(user.name, name)).get();
			if (u) return { errors: ["User with this name already exists."], name };
			out["name"] = name;
		}
		if (pas1) {
			if (pas1 !== pas2) return { errors: ["Passwords are not the same"], name };
			out["password"] = hash(pas1);
		}

		if (out.name || out.password) {
			const u = await db.update(user).set(out).where(eq(user.id, event.locals.user.id)).returning({ name: user.name }).get();
			if (u) {
				event.locals.user.name = u.name;
				return {
					success: true,
					name: u.name,
				};
			}
			//TODO Error
		}
		return {
			name: name,
		};
	},
};
