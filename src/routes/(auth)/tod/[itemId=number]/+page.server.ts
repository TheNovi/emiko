import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getItem } from "$lib/server/tod";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	// return { tod: await getAllChildren(event.locals.user.id, +event.params.itemId, 1) };
	return { tod: await getItem(event.locals.user.id, +event.params.itemId) };
}) satisfies PageServerLoad;
