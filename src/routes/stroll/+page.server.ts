import { getStrollPlaceWeek } from "#lib/server/stroll.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	return { week: await getStrollPlaceWeek() };
};
