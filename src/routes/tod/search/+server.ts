import { searchItem, type SearchItem } from "#lib/server/tod.js";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) error(403);
	const s = url.searchParams.get("v");
	if (!s) return Response.json([]);

	return Response.json(await searchItem(locals.user?.id, s));
};
