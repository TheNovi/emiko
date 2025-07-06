import { getEmptyItemDetail, getItemDetail } from "$lib/server/tod";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

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
