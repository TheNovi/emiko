import { db } from "$lib/server/db";
import { todItem } from "$lib/server/db/schema";
import { and, eq, inArray, isNull, sql, type SQLWrapper } from "drizzle-orm";

type ParentItems = Awaited<ReturnType<typeof getParents>>;
type ItemDetail = typeof todItem.$inferSelect & { parents: ParentItems };

function basicWhere(userId: number, ...other: SQLWrapper[]) {
	return and(eq(todItem.userId, userId), isNull(todItem.deletedAt), ...other);
}

export async function getItemDetail(userId: number, itemId: number) {
	return await db
		.select()
		.from(todItem)
		.where(basicWhere(userId, eq(todItem.id, itemId)))
		.get()
		.then(async (i) => {
			if (i) (i as ItemDetail).parents = await getParents(userId, i.id);
			return i as ItemDetail;
		});
}

export async function getEmptyItemDetail(userId: number, parentId: number): ReturnType<typeof getItemDetail> {
	return {
		id: 0,
		userId,
		parents: await getParents(userId, parentId),
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		parentId,
		title: "",
		state: 1,
		description: "",
		dateFrom: null,
		dateTo: null,
		dateCopyOffset: null,
		dateCopyMode: null,
	};
}

export async function getItem(userId: number, itemId: number = 0) {
	// type Item = Awaited<ReturnType<typeof getImmediateChildren>>[0] & { children?: boolean };
	type Items = Awaited<ReturnType<typeof getImmediateChildren>>;

	let r: { items: Items; parents: ParentItems } = { items: await getImmediateChildren(userId, itemId), parents: await getParents(userId, itemId) };
	//Unused
	// for (const item of r.items) {
	// 	item.children = await hasChildren(userId, item.id); //TODO 1 As subquery
	// }
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

async function getParents(userId: number, itemId: number) {
	// Drizzle doesn't have with recursive
	const q = await db
		.all(
			sql`WITH RECURSIVE p(id) AS (
    VALUES(${itemId}) -- Start value
    UNION
    SELECT parent_id FROM tod_item, p -- Get next parent (adds new line, which is used in next loop)
    WHERE tod_item.id=p.id
  )
  SELECT id FROM tod_item WHERE tod_item.id IN p; -- Select anything you want, but only items from select above (p has ids of all parents)`
		)
		.then((v) => (v as { id: number }[]).map((i) => i.id));

	//It can be done in one drizzle query, but it looks real bad and most likely slower than current solution. Once I start optimizing this, it would be best to do it in one sql``
	return await db
		.select({ id: todItem.id, title: todItem.title })
		.from(todItem)
		.where(basicWhere(userId, inArray(todItem.id, q)));
}

async function getImmediateChildren(userId: number, parentId: number = 0) {
	return await db
		.select({ id: todItem.id, title: todItem.title, state: todItem.state })
		.from(todItem)
		.where(basicWhere(userId, parentId ? eq(todItem.parentId, parentId) : isNull(todItem.parentId)));
	// .toSQL().sql;
}

export async function checkIfItemBelongsUser(userId: number, itemId?: number | null) {
	if (!itemId) return true; //New or root
	let o = await db
		.select({ id: todItem.id })
		.from(todItem)
		.where(and(eq(todItem.id, itemId), eq(todItem.userId, userId)));
	return !!o.length;
}

/**
 * Check if parentId belongs to user before running this
 * @param item
 */
export async function updateItem(item: Partial<typeof todItem.$inferSelect> & { id: number; userId: number }) {
	await db
		.update(todItem)
		.set({ ...item, id: undefined, userId: undefined, parentId: item.parentId ? item.parentId : null })
		.where(and(eq(todItem.id, item.id), eq(todItem.userId, item.userId)));
}

/**
 * Check if parentId belongs to user before running this
 * @param item
 */
export async function insertItem(item: typeof todItem.$inferInsert) {
	let d = await db
		.insert(todItem)
		.values({ ...item, id: undefined, parentId: item.parentId ? item.parentId : null })
		.returning({ id: todItem.id })
		.get();
	return d.id;
}
