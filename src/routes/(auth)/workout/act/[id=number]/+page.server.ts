import { deleteActivity, getActivity, updateActivity } from "$lib/server/workout";
import { fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	const act = await getActivity(event.locals.user.id, +event.params.id);
	if (!act) redirect(303, "/workout");
	return { act };
}) satisfies PageServerLoad;

const vFormNumber = v.pipe(
	v.string(),
	v.digits(),
	v.transform((id) => +id),
	v.number(),
	v.minValue(0),
	v.maxValue(10000000) //10 mil
);

export const actions: Actions = {
	save: async ({ locals, request }) => {
		// console.log("saveActivity");
		// return;
		if (!locals.user) return redirect(303, "/login");
		let errors: string[] = [];
		// const d = await request.formData();
		// console.log(d);

		//Inputs: Empty => '', Disabled/Hidden => undefined (nullish() means null or undefined)
		const item = v.safeParse(
			v.object({
				id: vFormNumber,
				userId: v.optional(v.number(), -1), //Filled below
				reps: vFormNumber,
				sets: vFormNumber,
				value: vFormNumber, //TODO Test float
			}),
			Object.fromEntries(await request.formData())
			// Object.fromEntries(d)
		);
		if (!item.success) return fail(400, { errors: item.issues.map((i) => i.message) });
		item.output.userId = locals.user.id;
		// console.log(item.output);
		// return;

		await updateActivity(locals.user.id, item.output); //Update/Insert //TODO Catch errors

		if (errors.length == 0) return { success: true };
		else return fail(400, { errors });
	},
	delete: async ({ locals, request }) => {
		// console.log("saveActivity");
		// return;
		if (!locals.user) return redirect(303, "/login");
		let errors: string[] = [];
		// const d = await request.formData();
		// console.log(d);

		//Inputs: Empty => '', Disabled/Hidden => undefined (nullish() means null or undefined)
		const item = v.safeParse(
			v.looseObject({
				id: vFormNumber,
			}),
			Object.fromEntries(await request.formData())
			// Object.fromEntries(d)
		);
		if (!item.success) return fail(400, { errors: item.issues.map((i) => i.message) });
		item.output.userId = locals.user.id;
		// console.log(item.output);
		// return;

		await deleteActivity(locals.user.id, item.output.id); //Update/Insert //TODO Catch errors

		if (errors.length == 0) return { success: true, deleted: true };
		else return fail(400, { errors });
	},
};
