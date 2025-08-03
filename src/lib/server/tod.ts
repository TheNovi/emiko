import { db } from "$lib/server/db";
import { todItem } from "$lib/server/db/schema";
import { and, eq, isNull, sql, type SQLWrapper } from "drizzle-orm";

type ParentItems = Awaited<ReturnType<typeof getParents>>;
type ItemDetail = typeof todItem.$inferSelect & { parents: ParentItems; items: Awaited<ReturnType<typeof getChildren>> };

function basicWhere(userId: number, ...other: SQLWrapper[]) {
	return and(eq(todItem.userId, userId), isNull(todItem.deletedAt), ...other);
}

export async function getItemDetail(userId: number, itemId: number): Promise<ItemDetail | undefined> {
	if (!itemId) return await getEmptyItemDetail(userId, null, await getChildren(userId, itemId));
	return await db
		.select()
		.from(todItem)
		.where(basicWhere(userId, eq(todItem.id, itemId)))
		.get()
		.then(async (e) => {
			if (e) {
				(e as ItemDetail).parents = await getParents(userId, e.id);
				(e as ItemDetail).items = await getChildren(userId, e.id);
			}
			return e as ItemDetail;
		});
}

export async function getEmptyItemDetail(userId: number, parentId: number | null, items: ItemDetail["items"] = []): Promise<ItemDetail> {
	return {
		id: 0,
		userId,
		parents: await getParents(userId, parentId),
		items,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		parentId,
		title: parentId != null ? "" : "Tod",
		state: 1,
		description: "",
		dateFrom: null,
		dateTo: null,
		dateCopyOffset: null,
		dateCopyMode: null,
	};
}

async function getParents(userId: number, itemId: number | null): Promise<{ id: number; title: string }[]> {
	if (!itemId) return []; //Root
	// Gets all parents using 'with recursive' and saves them to p
	// Selects from p and joins tod_item for title column (selecting from p keeps parent order. Selecting from tod_item would sort parents by rowid, which is wrong)
	// offset removes self from the result (limit must be there for valid syntax :/)
	return await db
		.all<{ id: number; title: string }>(
			sql`
		WITH RECURSIVE p(id) AS (
			VALUES(${itemId}) -- Start value
			UNION
			SELECT parent_id FROM tod_item, p WHERE tod_item.id=p.id AND user_id=${userId}
		)
		SELECT p.id, title FROM p left join tod_item on p.id=tod_item.id limit -1 offset 1;`
		)
		.then((e) => {
			e.pop();
			return e;
		});
}

async function getChildren(userId: number, parentId: number = 0) {
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
