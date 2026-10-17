import { getStrollPlaceRandom } from "#lib/server/stroll.js";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
	return Response.json(await getStrollPlaceRandom());
};
