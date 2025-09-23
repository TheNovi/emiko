import { getCal } from "$lib/server/todCal";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Get all events from Cal (inside date range), with users timezone
// params.date is start of today (from user's timezone view), represented in epoch
export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user || !locals.user.id) return error(403, "No user found");
	const day = 3600000 * 24;
	const n = +params.date;
	if (!n || isNaN(n)) return error(400, "Invalid date param: " + params.date);
	if (n < 3 * day) return error(400, "Date param too low: " + n);

	const from = new Date(n - day * 3);
	// const from = new Date(n);
	const to = new Date(n + day * 31);
	return json({ cal: await getCal(locals.user.id, from, to), from, to });
};
