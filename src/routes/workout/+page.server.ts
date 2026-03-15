import {
	deleteMachine,
	getAllMachines,
	getDailyActivity,
	insertActivity,
	insertMachine,
	updateMachine,
} from "$lib/server/workout";
import { fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	//TODO 0 Promise.all()
	return {
		machines: await getAllMachines(event.locals.user.id),
		act: await getDailyActivity(event.locals.user.id, event.locals.user.tz),
	};
}) satisfies PageServerLoad;

// TODO 999 Make these to univ. funcs.
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

const vFormEmpty = v.pipe(
	v.literal(""),
	v.transform(() => null)
);
const vFormEmptyZero = v.pipe(
	v.literal(""),
	v.transform(() => 0)
);

export const actions: Actions = {
	save: async ({ locals, request }) => {
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
				unit: vFormNumber,
				qrcode: v.pipe(v.string("QrCode must be string"), v.trim(), v.maxLength(250, "QrCode is too long")),
				tags: v.pipe(v.string("Tags must be string"), v.trim(), v.maxLength(250, "Tags are too long")),
			}),
			Object.fromEntries(await request.formData())
			// Object.fromEntries(d)
		);
		if (!item.success) return fail(400, { errors: item.issues.map((i) => i.message) });
		item.output.userId = locals.user.id;
		// console.log(item.output);
		// return;

		let id;
		if (item.output.id)
			await updateMachine(locals.user.id, item.output); //TODO Catch errors
		else id = (await insertMachine(locals.user.id, item.output)).id;

		if (errors.length == 0) return { success: true, o: { id } };
		else return fail(400, { errors });
	},
	delete: async ({ locals, request }) => {
		// console.log("deleteMachine");
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

		await deleteMachine(locals.user.id, item.output.id); //Update/Insert //TODO Catch errors

		if (errors.length == 0) return { success: true, close: true };
		else return fail(400, { errors });
	},
	activityAdd: async ({ locals, request }) => {
		// console.log("activityAdd");
		// return;
		if (!locals.user) return redirect(303, "/login");
		let errors: string[] = [];
		// const d = await request.formData();
		// console.log(d);

		//Inputs: Empty => '', Disabled/Hidden => undefined (nullish() means null or undefined)
		const item = v.safeParse(
			v.looseObject({
				id: vFormNumber,
				userId: v.optional(v.number(), -1), //Filled below
				name: v.pipe(v.string("Name must be string"), v.trim(), v.maxLength(60, "Name is too long")),
				reps: vFormNumber,
				sets: vFormNumber,
				value: vFormFloat,
			}),
			Object.fromEntries(await request.formData())
			// Object.fromEntries(d)
		);
		if (!item.success) return fail(400, { errors: item.issues.map((i) => i.message) });
		// console.log(item.output);
		// return;

		const o = await insertActivity(locals.user.id, {
			userId: locals.user.id,
			machineId: item.output.id,
			reps: item.output.reps,
			sets: item.output.sets,
			value: item.output.value,
		}); //TODO Catch errors

		if (!o) errors.push("Empty result from db");

		if (errors.length == 0) return redirect(303, `/workout/act/${o?.id}`);
		else return fail(400, { errors });
	},
};
