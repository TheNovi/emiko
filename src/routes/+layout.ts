import { browser } from "$app/environment";
import { Settings } from "luxon";
import type { LayoutLoad } from "./$types";

export const load = (async ({ data }) => {
	if (browser) Settings.defaultZone = data.user?.tz || ""; //Lets pray this works
	return data;
}) satisfies LayoutLoad;
