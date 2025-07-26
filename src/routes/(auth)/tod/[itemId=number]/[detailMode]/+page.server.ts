import { checkIfItemBelongsUser, getEmptyItemDetail, getItemDetail, insertItem, updateItem } from "$lib/server/tod";
import { error, fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	let tod;
	switch (event.params.detailMode) {
		case "e":
			tod = await getItemDetail(event.locals.user.id, +event.params.itemId); //Edit item
			break;
		case "n":
			tod = await getEmptyItemDetail(event.locals.user.id, +event.params.itemId); //New item (returns mostly empty item, with id=0)
			break;
		default:
			redirect(303, new URL("e", event.url)); //Replaces last param with "e"
	}
	if (!tod) error(404, "Unable to find itemId: " + event.params.itemId);
	return { tod };
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
	v.isoDateTime(),
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
		// return;

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
				timezoneOffset: v.union([
					v.pipe(
						v.literal(""),
						v.transform(() => undefined)
					),
					v.pipe(
						v.string(),
						v.decimal(),
						v.transform((e) => +e),
						v.number()
					),
				]),
			}),
			Object.fromEntries(await request.formData())
		);
		if (!item.success) return fail(400, { errors: item.issues.map((i) => i.message) });
		item.output.userId = locals.user.id;
		console.log(process.env.TZ);

		if (item.output.timezoneOffset) {
			let t = item.output.timezoneOffset * 60000;
			t = new Date().getTimezoneOffset() * 60000 - t;
			if (item.output.dateFrom) item.output.dateFrom = new Date(item.output.dateFrom?.getTime() - t);
			if (item.output.dateTo) item.output.dateTo = new Date(item.output.dateTo?.getTime() - t);
		} else {
			item.output.dateFrom = null;
			item.output.dateTo = null;
		}
		console.log(item.output);
		// return;

		delete item.output.timezoneOffset;
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
