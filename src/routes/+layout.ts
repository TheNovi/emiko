import { browser } from "$app/env";
import { Settings } from "luxon";
import type { LayoutLoad } from "./$types";

export const load = (async ({ data }) => {
	if (browser) Settings.defaultZone = data.user?.tz || ""; //Lets pray this works
	return data;
}) satisfies LayoutLoad;
