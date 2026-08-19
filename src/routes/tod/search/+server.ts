import { searchItem, type SearchItem } from "$lib/server/tod";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) error(403);
	const s = url.searchParams.get("v");
	if (!s) return json([]);

	return json(await searchItem(locals.user?.id, s));
};
