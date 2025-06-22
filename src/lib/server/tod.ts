import { db } from "$lib/server/db";
import { todItem, user } from "$lib/server/db/schema";
import { and, eq, isNull, type SQLWrapper } from "drizzle-orm";

function basicWhere(userId: number, ...other: SQLWrapper[]) {
	return and(eq(todItem.userId, userId), isNull(todItem.deletedAt), ...other);
}

export async function getItemDetail(userId: number, itemId: number) {
	return await db
		.select()
		.from(todItem)
		.where(basicWhere(userId, eq(todItem.id, itemId)))
		.get();
}

export async function getItem(userId: number, parentId: number = 0) {
	type Item = Awaited<ReturnType<typeof getImmediateChildren>>[0] & { children?: boolean };
	type ParentItem = Awaited<ReturnType<typeof getParent>>;

	let r: { items: Item[]; parent: ParentItem } = { items: await getImmediateChildren(userId, parentId), parent: await getParent(userId, parentId) };
	for (const item of r.items) {
		item.children = await hasChildren(userId, item.id); //TODO 3 As subquery
	}
	return r;
}

async function hasChildren(userId: number, itemId: number) {
	return await db
		.select({ id: todItem.id })
		.from(todItem)
		.where(basicWhere(userId, eq(todItem.parentId, itemId)))
		.limit(1)
		.get()
		.then((v) => !!v);
}

async function getParent(userId: number, parentId: number) {
	return await db
		.select({ id: todItem.id, title: todItem.title })
		.from(todItem)
		.where(basicWhere(userId, eq(todItem.id, parentId)))
		.get()
		.then((v) => (v ? v : { id: parentId, title: "" }));
}

async function getImmediateChildren(userId: number, parentId: number = 0) {
	return await db
		.select({ id: todItem.id, title: todItem.title, state: todItem.state })
		.from(todItem)
		.where(basicWhere(userId, parentId ? eq(todItem.parentId, parentId) : isNull(todItem.parentId)));
	// .toSQL().sql;
}
