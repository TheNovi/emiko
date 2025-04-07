import { db } from "$lib/server/db";
import { bobImage } from "$lib/server/db/schema";
import { fail, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import * as v from "valibot";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
}) satisfies PageServerLoad;

const vId = v.pipe(
	v.string(),
	v.transform((id) => +id),
	v.number(),
	v.minValue(1)
);

const FormCheckBox = v.exactOptional(
	v.union([
		v.pipe(
			v.literal("on"),
			v.transform(() => true)
		),
		v.pipe(
			v.unknown(),
			v.transform(() => false)
		),
	]),
	false
);

//Edit properties of BobImage (like description, public, etc.)
export const actions: Actions = {
	default: async ({ locals, request }) => {
		if (!locals.user) return redirect(303, "/login");
		const data = v.safeParse(
			v.object({
				id: vId,
				public: FormCheckBox,
				favorite: FormCheckBox,
				description: v.optional(v.union([v.literal(""), v.pipe(v.string(), v.trim(), v.maxLength(250, "Maximum of 250 characters"))])),
			}),
			{ ...Object.fromEntries(await request.formData()) }
		);
		if (!data.success) return fail(400, { errors: data.issues.map((i) => i.message) });
		// console.log(data.output);

		// return {};
		//Valibot filters all unspecified fields
		const d = await db
			.update(bobImage)
			.set({ ...data.output, id: undefined })
			.where(and(eq(bobImage.id, data.output.id), eq(bobImage.userId, locals.user.id)));
		return { success: true };
	},
};
