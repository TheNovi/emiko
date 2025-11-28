import { getCal } from "$lib/server/todCal";
import { error, redirect } from "@sveltejs/kit";
import { DateTime } from "luxon";
import type { PageServerLoad } from "./$types";

// if (dev) process.env.TZ = "utc"; //For debug

export const load = (async ({ locals }) => {
	if (!locals.user) redirect(303, "/login");

	if (!locals.user || !locals.user.id) return error(403, "No user found");
	const d = DateTime.now().setZone(locals.user.tz).startOf("day");

	const from = d.minus({ day: 3 });
	const to = d.plus({ month: 1 });

	return { ...(await getCal(locals.user.id, locals.user.tz, from, to)), from, to };
}) satisfies PageServerLoad;
