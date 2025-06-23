import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getItemDetail } from "$lib/server/tod";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	let tod = await getItemDetail(event.locals.user.id, +event.params.itemId);
	if (!tod) error(404, "Unable to find itemId: " + event.params.itemId);
	return { tod };
}) satisfies PageServerLoad;
