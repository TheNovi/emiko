import { createCookie, getUserFromCookie, logoutUser } from "#lib/server/auth.js";
import { db } from "#lib/server/db/index.js";
import { user } from "#lib/server/db/schema.js";
import { APP_VERSION } from "$app/env/public";
import type { Handle } from "@sveltejs/kit/hooks";
import { eq } from "drizzle-orm";
import { Settings } from "luxon";

console.log(APP_VERSION);
Settings.defaultZone = "utc"; //Just for consistency and better debugging

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = undefined;
	const j = await getUserFromCookie(event.cookies);
	if (j && j.id != undefined) {
		let u = await db
			.select({ id: user.id, name: user.name, tz: user.tz, deleteAt: user.deletedAt })
			.from(user)
			.where(eq(user.id, j.id))
			.get();

		if (u && !u.deleteAt) {
			event.locals.user = { id: u.id, name: u.name, tz: u.tz };
			createCookie(event.cookies, u);
		} else logoutUser(event.cookies);
	} //TODO else logoutUser(event.cookies);
	return resolve(event);
};
