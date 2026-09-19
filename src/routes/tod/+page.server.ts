import { getItemDetail, updateItem } from "$lib/server/tod";
import { getCal, type CallItem } from "$lib/server/todCal";
import { todIsTask, todTaskComplete } from "$lib/todUtil";
import { error, fail, redirect } from "@sveltejs/kit";
import { DateTime } from "luxon";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {
	if (!locals.user) redirect(303, "/login");

	const s = url.searchParams.get("d");

	let d: DateTime = DateTime.now();
	if (s) d = DateTime.fromISO(s);
	if (!d.isValid) return error(400, "Invalid Date");
	d = d.setZone(locals.user.tz).startOf("day");

	const from = d;
	const to = d.plus({ month: 1 });

	return { ...(await getCal(locals.user.id, locals.user.tz, from, to)), from, to };
}) satisfies PageServerLoad;

export const actions: Actions = {
	completeTask: async ({ locals, request }) => {
		if (!locals.user) return redirect(303, "/login");
		const itemId = (await request.formData()).get("id");
		// TODO 0 Implement Errors on client
		if (!itemId) return fail(400, { errors: ["id is empty"] }); //User should never get this error
		// getItemDetail already check userId
		// if (!(await checkIfItemBelongsUser(locals.user.id, +itemId)))
		// 	return fail(400, { errors: ["id does not belong to user"] }); //User should never get this error

		let item = await getItemDetail(locals.user.id, +itemId, locals.user.tz);
		if (!item || !item.id) return fail(400, { errors: ["item is empty"] }); //User should never get this error
		if (item.userId !== locals.user.id) return fail(400, { errors: ["id does not belong to user"] }); //Just to be sure //User should never get this error
		if (!item.dtStart || !todIsTask(item)) return fail(400, { errors: ["item is not task"] }); //User should never get this error
		todTaskComplete(item as CallItem); // TODO 0 Check if something changed
		await updateItem(item);

		return redirect(303, `/tod`); //TODO 0 keep url
	},
};
