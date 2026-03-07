import { db } from "$lib/server/db";
import { woMachine, woActivity } from "$lib/server/db/schema";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { DateTime } from "luxon";

export type WoMachine = Omit<typeof woMachine.$inferSelect, "userId" | "createdAt" | "deletedAt" | "updatedAt">;

export async function getAllMachines(userId: number) {
	return await db
		.select() //TODO Remove unused fields
		.from(woMachine)
		.where(and(eq(woMachine.userId, userId), isNull(woMachine.deletedAt)))
		.orderBy(woMachine.name);
}

export async function insertMachine(m: typeof woMachine.$inferInsert) {
	if (m.id) return await db.update(woMachine).set(m).where(eq(woMachine.id, m.id));
	else await db.insert(woMachine).values({ ...m, id: undefined });
}

export async function getDailyActivity(userId: number, tz: string) {
	return await db
		.select() //TODO Remove unused fields
		.from(woActivity)
		.leftJoin(woMachine, eq(woActivity.machineId, woMachine.id))
		.where(
			and(
				eq(woActivity.userId, userId),
				isNull(woActivity.deletedAt),
				gt(woActivity.createdAt, DateTime.now().setZone(tz).startOf("day").toJSDate())
			)
		)
		.orderBy(desc(woActivity.createdAt));
}
