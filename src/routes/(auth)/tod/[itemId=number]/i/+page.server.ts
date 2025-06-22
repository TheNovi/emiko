import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getItemDetail } from "$lib/server/tod";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	let item = await getItemDetail(event.locals.user.id, +event.params.itemId);
	if (!item) error(404, "Unable to find itemId: " + event.params.itemId);
	return { item: item };
}) satisfies PageServerLoad;
