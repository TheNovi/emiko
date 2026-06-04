import { deleteActivity, getActivity, getMachineActivity, updateActivity, updateMachine } from "$lib/server/workout";
import { fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	const act = await getActivity(event.locals.user.id, +event.params.id);
	if (!act) redirect(303, "/workout");
	return { act, acts: await getMachineActivity(event.locals.user.id, act.machine.id) };
}) satisfies PageServerLoad;

const vFormNumber = v.pipe(
	v.string(),
	v.digits(),
	v.transform((id) => +id),
	v.number(),
	v.minValue(0),
	v.maxValue(10000000) //10 mil
);
const vFormFloat = v.pipe(
	v.string(),
	v.decimal(),
	v.transform((id) => +id),
	v.number(),
	v.minValue(0),
	v.maxValue(10000000) //10 mil
);
const vFormCheckbox = v.nullish(
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
				value: vFormFloat,
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
	saveMachine: async ({ locals, request }) => {
		//! Copied from Workout
		// console.log("saveMachine");
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
				name: v.pipe(v.string("Name must be string"), v.trim(), v.maxLength(60, "Name is too long")),
				text: v.pipe(v.string("Text must be string"), v.trim(), v.maxLength(250, "Text is too long")),
				reps: vFormNumber,
				sets: vFormNumber,
				value: vFormFloat,
				unit: v.pipe(v.string("Unit must be string"), v.trim(), v.maxLength(25, "Unit is too long")),
				// tags: v.pipe(v.string("Tags must be string"), v.trim(), v.maxLength(250, "Tags are too long")),
				hands: vFormCheckbox,
				legs: vFormCheckbox,
				belly: vFormCheckbox,
				push: vFormCheckbox,
				pull: vFormCheckbox,
				cardio: vFormCheckbox,
				other: vFormCheckbox,
			}),
			Object.fromEntries(await request.formData())
			// Object.fromEntries(d)
		);
		if (!item.success) return fail(400, { errors: item.issues.map((i) => i.message) });
		item.output.userId = locals.user.id;
		// console.log(item.output);
		// return;

		await updateMachine(locals.user.id, item.output); //TODO Catch errors

		if (errors.length == 0) return { success: true };
		else return fail(400, { errors });
	},
};
