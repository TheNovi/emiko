import { checkIfItemBelongsUser, deleteItem, getItemDetail, insertItem, updateItem } from "$lib/server/tod";
import { fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	let tod = await getItemDetail(event.locals.user.id, +event.params.itemId);
	return tod ? { tod } : redirect(303, "/tod");
}) satisfies PageServerLoad;

const vFormNumber = v.pipe(
	v.string(),
	v.digits(),
	v.transform((id) => +id),
	v.number(),
	v.minValue(0)
);

const vFormDate = v.pipe(
	v.string(),
	v.isoTimestamp("Not valid date format"),
	v.transform((e) => new Date(e)),
	v.date()
);

const vFormEmpty = v.pipe(
	v.literal(""),
	v.transform(() => null)
);

export const actions: Actions = {
	add: async ({ locals, params: { itemId } }) => {
		// console.log("add");
		// return;
		if (!locals.user) return redirect(303, "/login");
		if (!(await checkIfItemBelongsUser(locals.user.id, +itemId))) return fail(400, { errors: ["Parent id does not belong to user"] }); //User should never get this error
		let n = await insertItem(locals.user.id, +itemId || null, "New Item");
		return redirect(303, `/tod/${n}`);
	},
	delete: async ({ locals, params: { itemId } }) => {
		// console.log("delete");
		// return;
		if (!locals.user) return redirect(303, "/login");
		let n = await deleteItem(locals.user.id, +itemId);
		return redirect(303, `/tod/${n}`);
	},
	save: async ({ locals, request }) => {
		// console.log("save");
		// return;
		if (!locals.user) return redirect(303, "/login");
		let errors: string[] = [];
		// console.log(await request.formData());

		const item = v.safeParse(
			v.object({
				id: vFormNumber,
				userId: v.optional(v.number(), -1), //Filled below
				parentId: v.union([vFormEmpty, vFormNumber]), //Empty means root
				state: vFormNumber,
				title: v.pipe(v.string("Title must be string"), v.trim(), v.nonEmpty("Title must not be empty"), v.maxLength(250, "Title is too long")),
				description: v.pipe(v.string("Description must be string"), v.trim(), v.maxLength(2500, "Description is too long")),
				dtStart: v.union([vFormEmpty, vFormDate]),
				dtEnd: v.nullish(v.union([vFormEmpty, vFormDate])),
				rFreq: v.nullish(v.union([vFormEmpty, vFormNumber])),
				rInterval: v.nullish(v.union([vFormEmpty, vFormNumber])),
				rUntil: v.nullish(v.union([vFormEmpty, vFormDate])),
			}),
			Object.fromEntries(await request.formData())
		);
		if (!item.success) return fail(400, { errors: item.issues.map((i) => i.message) });
		item.output.userId = locals.user.id;
		// console.log(item.output);
		// return;

		if (!(await checkIfItemBelongsUser(item.output.userId, item.output.parentId))) return fail(400, { errors: ["Parent id does not belong to user"] }); //User should never get this error
		await updateItem(item.output);

		if (errors.length == 0) return { success: true };
		else return fail(400, { errors });
	},
};
