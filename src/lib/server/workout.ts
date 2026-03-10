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

export async function insertMachine(userId: number, r: typeof woMachine.$inferInsert) {
	r.userId = userId;
	return await db
		.insert(woMachine)
		.values({ ...r, id: undefined })
		.returning({ id: woMachine.id })
		.get();
}
export async function updateMachine(userId: number, r: Partial<typeof woMachine.$inferSelect> & { id: number }) {
	r.userId = userId;
	return await db
		.update(woMachine)
		.set(r)
		.where(and(eq(woMachine.userId, r.userId), eq(woMachine.id, r.id)));
}
export async function deleteMachine(userId: number, id: number) {
	return await db
		.update(woMachine)
		.set({ deletedAt: new Date() })
		.where(and(eq(woMachine.userId, userId), eq(woMachine.id, id)));
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
			reps: woActivity.reps,
			sets: woActivity.sets,
			value: woActivity.value,
			updatedAt: woActivity.updatedAt,
		})
		.from(woActivity)
		.innerJoin(woMachine, eq(woActivity.machineId, woMachine.id))
		.where(and(eq(woActivity.userId, userId), isNull(woActivity.deletedAt), eq(woActivity.id, id)))
		.orderBy(desc(woActivity.createdAt))
		.get();
}
export async function insertActivity(userId: number, r: typeof woActivity.$inferInsert) {
	r.userId = userId;
	return await db
		.insert(woActivity)
		.values({ ...r, id: undefined })
		.returning({ id: woActivity.id })
		.get();
}
export async function updateActivity(userId: number, r: Partial<typeof woActivity.$inferSelect> & { id: number }) {
	r.userId = userId;
	return await db
		.update(woActivity)
		.set(r)
		.where(and(eq(woActivity.userId, r.userId), eq(woActivity.id, r.id)));
}
export async function deleteActivity(userId: number, id: number) {
	return await db
		.update(woActivity)
		.set({ deletedAt: new Date() })
		.where(and(eq(woActivity.userId, userId), eq(woActivity.id, id)));
}
