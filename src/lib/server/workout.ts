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
		.select({
			id: woActivity.id,
			mName: woMachine.name,
			reps: woActivity.reps,
			sets: woActivity.sets,
			value: woActivity.value,
			updatedAt: woActivity.updatedAt,
		})
		.from(woActivity)
		.innerJoin(woMachine, eq(woActivity.machineId, woMachine.id))
		.where(
			and(
				eq(woActivity.userId, userId),
				isNull(woActivity.deletedAt),
				gt(woActivity.createdAt, DateTime.now().setZone(tz).startOf("day").toJSDate())
			)
		)
		.orderBy(desc(woActivity.createdAt));
}

export async function getActivity(userId: number, id: number) {
	return await db
		.select({
			id: woActivity.id,
			mName: woMachine.name,
			mText: woMachine.text,
			mUnit: woMachine.unit,
			mPause: woMachine.pause,
			reps: woActivity.reps,
			sets: woActivity.sets,
			value: woActivity.value,
			updatedAt: woActivity.updatedAt,
		})
		.from(woActivity)
		.innerJoin(woMachine, eq(woActivity.machineId, woMachine.id))
		.where(
			and(
				eq(woActivity.userId, userId),
				// isNull(woActivity.deletedAt),
				eq(woActivity.id, id)
			)
		)
		.orderBy(desc(woActivity.createdAt))
		.get();
}

export async function insertActivity(m: typeof woActivity.$inferInsert) {
	if (m.id)
		return await db.update(woActivity).set(m).where(eq(woActivity.id, m.id)).returning({ id: woActivity.id }).get();
	else
		return await db
			.insert(woActivity)
			.values({ ...m, id: undefined })
			.returning({ id: woActivity.id })
			.get();
}
