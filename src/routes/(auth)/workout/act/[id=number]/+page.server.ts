import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getActivity } from "$lib/server/workout";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	const act = await getActivity(event.locals.user.id, +event.params.id);
	if (!act) redirect(303, "/workout");
	return { act };
}) satisfies PageServerLoad;
