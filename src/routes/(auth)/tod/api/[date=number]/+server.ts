import { getCal } from "$lib/server/todCal";
import { error, json } from "@sveltejs/kit";
import { DateTime } from "luxon";
import type { RequestHandler } from "./$types";

// if (dev) process.env.TZ = "utc"; //For debug

// Get all events from Cal (inside date range), with users timezone
export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user || !locals.user.id) return error(403, "No user found");
	const d = DateTime.fromMillis(+params.date, { zone: locals.user.tz });
	if (!d.isValid) return error(400, `TodCal | Invalid date param: '${params.date}' luxon error ${d.invalidReason} ${d.invalidExplanation}`);

	const from = d.minus({ day: 3 });
	const to = d.plus({ month: 1 });

	return json({ cal: await getCal(locals.user.id, locals.user.tz, from, to), from, to });
};
