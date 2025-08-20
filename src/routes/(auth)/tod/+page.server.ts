import { getCal } from "$lib/server/todCal";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async (event) => {
	if (!event.locals.user) redirect(303, "/login");
	const day = 3600000 * 24;
	const from = new Date(Date.now() - day * 7);
	// const to = new Date(Date.now() + day * 7);
	const to = new Date(from);
	to.setMonth(from.getMonth() + 1);
	from.setUTCHours(0, 0, 0, 0);
	to.setUTCHours(0, 0, 0, 0);
	return { cal: await getCal(event.locals.user.id, from, to), from, to };
}) satisfies PageServerLoad;
