import { db } from "$lib/server/db";
import { stroll } from "$lib/server/db/schema";
import { createHash } from "crypto";
import { sql } from "drizzle-orm";

/**
 * {weekFrom1970-1-1}
 */
function seedEpochWeek() {
	const d = new Date(); //Can be local, only getTime is used
	// const s = (6 + new Date(0).getUTCDay()) % 7; //Get day of 1970-1-1, but start week on monday
	const s = 3; //Same as line above
	return Math.ceil((d.getTime() / 86400000 + s) / 7);
}

function r(v: number) {
	// console.log(v);
	return parseInt(
		"0x" +
			createHash("SHA256")
				.update(v + "")
				.digest("hex")
				.slice(0, 4), //This limits max number (can be changed if needed)
		16
	);
}

export async function getStrollPlaceWeek() {
	const i = r(seedEpochWeek());
	let p = await db
		.select({ name: stroll.name, region: stroll.region, tz: stroll.tz })
		.from(stroll)
		.where(sql`rowid = ${i} % (SELECT max(rowid) FROM stroll) + 1`);
	//Not working on missing rowids
	return p[0];
}

export async function getStrollPlaceRandom() {
	let p = await db
		.select({ name: stroll.name, region: stroll.region, tz: stroll.tz })
		.from(stroll)
		.where(sql`rowid = abs(random()) % (SELECT max(rowid) FROM stroll) + 1`);
	// Not working on missing rowids
	return p[0];
}
