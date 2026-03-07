import { getAllMachines, getDailyActivity, insertMachine } from "$lib/server/workout";
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

const vFormEmpty = v.pipe(
	v.literal(""),
	v.transform(() => null)
);
const vFormEmptyZero = v.pipe(
	v.literal(""),
	v.transform(() => 0)
);

export const actions: Actions = {
	machineSave: async ({ locals, request }) => {
		// console.log("save");
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
				reps: vFormNumber,
				sets: vFormNumber,
				value: vFormNumber, //TODO Test float
				unit: vFormNumber,
				pause: vFormNumber,
				// qrcode: v.pipe(v.string("qrcode must be string"), v.trim(), v.maxLength(250, "QrCode is too long")),
				tags: v.pipe(v.string("Tags must be string"), v.trim(), v.maxLength(250, "Tags are too long")),
				// asd: v.nullish(v.union([vFormEmpty, vFormNumber]), null),
			}),
			Object.fromEntries(await request.formData())
			// Object.fromEntries(d)
		);
		if (!item.success) return fail(400, { errors: item.issues.map((i) => i.message) });
		item.output.userId = locals.user.id;
		console.log(item.output);
		// return;

		const r = await insertMachine(item.output); //Update/Insert

		if (errors.length == 0) return { success: true };
		else return fail(400, { errors });
	},
};
