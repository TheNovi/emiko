import { getCal } from "$lib/server/todCal";
import { error, redirect } from "@sveltejs/kit";
import { DateTime } from "luxon";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {
	if (!locals.user) redirect(303, "/login");

	const s = url.searchParams.get("d");

	let d: DateTime = DateTime.now();
	if (s) d = DateTime.fromISO(s);
	if (!d.isValid) return error(400, "Invalid Date");
	d = d.setZone(locals.user.tz).startOf("day");

	const from = d;
	const to = d.plus({ month: 1 });

	return { ...(await getCal(locals.user.id, locals.user.tz, from, to)), from, to };
}) satisfies PageServerLoad;
