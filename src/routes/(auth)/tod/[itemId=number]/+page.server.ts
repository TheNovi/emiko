import { checkIfItemBelongsUser, getItemDetail, insertItem, updateItem } from "$lib/server/tod";
import { fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	let tod = await getItemDetail(event.locals.user.id, +event.params.itemId);
	return tod ? { tod } : redirect(303, "/tod/0");
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
	default: async ({ locals, request }) => {
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
				dateFrom: v.union([vFormEmpty, vFormDate]),
				dateTo: v.union([vFormEmpty, vFormDate]),
				dateCopyOffset: v.union([
					vFormEmpty,
					v.pipe(
						vFormNumber,
						v.transform((e) => e * 24 * 3600 * 1000)
					),
				]),
			}),
			Object.fromEntries(await request.formData())
		);
		if (!item.success) return fail(400, { errors: item.issues.map((i) => i.message) });
		item.output.userId = locals.user.id;

		console.log(item.output);
		// return;

		if (!(await checkIfItemBelongsUser(item.output.userId, item.output.parentId))) return fail(400, { errors: ["Parent id does not belong to user"] }); //User should never get this error
		if (item.output.id) {
			// This check is not really necessary, updateItem updates checks for id and userId. And should be impossible to get this by normal use
			// if (!(await checkIfItemBelongsUser(item.output.userId, item.output.id))) return fail(400, { errors: ["Item id does not belong to user"] }); //User should never get this error
			await updateItem(item.output);
		} else {
			let id = await insertItem(item.output);
			return redirect(303, `/tod/${id}/e`);
		}

		if (errors.length == 0) return { success: true };
		else return fail(400, { errors });
	},
};
