import { building, dev } from "$app/environment";
import { createCookie, getUserFromCookie, logoutUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import type { Handle } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

console.log(APP_VERSION);
if (dev) process.env.TZ = "utc"; //Should work since node 13, but better to use only env in prod
if (!building && (process.env.TZ?.toLowerCase() !== "utc" || new Date().getTimezoneOffset() !== 0)) throw new Error("Timezone isn't utc '" + process.env.TZ + "' " + new Date().getTimezoneOffset());

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = undefined;
	const j = await getUserFromCookie(event.cookies);
	if (j && j.id != undefined) {
		let u = await db.select({ id: user.id, name: user.name, deleteAt: user.deletedAt }).from(user).where(eq(user.id, j.id)).get();

		if (u && !u.deleteAt) {
			event.locals.user = { id: u.id, name: u.name };
			createCookie(event.cookies, u);
		} else logoutUser(event.cookies);
	}
	return resolve(event);
};
