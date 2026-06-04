import { getAllActivities } from "$lib/server/workout";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	return { acts: await getAllActivities(event.locals.user.id) };
}) satisfies PageServerLoad;
