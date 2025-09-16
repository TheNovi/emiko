import { db } from "$lib/server/db";
import { todItem } from "$lib/server/db/schema";
import { and, desc, eq, isNull, sql, type SQLWrapper } from "drizzle-orm";

//Type for empty Root and SmartItemDetail select (it auto switches based on value in id) (discriminated unions)
type SmartItemDetail = ({ id: null; title: string } | typeof todItem.$inferSelect) & {
	parents: Awaited<ReturnType<typeof getParents>>;
	items: Awaited<ReturnType<typeof getChildren>>;
};

function basicWhere(userId: number, ...other: SQLWrapper[]) {
	return and(eq(todItem.userId, userId), isNull(todItem.deletedAt), ...other);
}

export async function getItemDetail(userId: number, itemId: number): Promise<SmartItemDetail | undefined> {
	if (!itemId) return await getRootItemDetail(userId);
	return await db
		.select() //TODO Remove unused fields (userId and deletedAt?)
		.from(todItem)
		.where(basicWhere(userId, eq(todItem.id, itemId)))
		.get()
		.then(async (e) => {
			if (e) {
				// if (e.dateFrom && e.dateTo) (e as ItemDetail).dateTo = new Date(e.dateFrom.getTime() + e.dateTo);
				(e as SmartItemDetail).parents = await getParents(userId, e.id);
				(e as SmartItemDetail).items = await getChildren(userId, e.id);
			}
			return e as SmartItemDetail | undefined;
		});
}

export async function getRootItemDetail(userId: number): Promise<SmartItemDetail> {
	return {
		id: null,
		// userId, //Not needed?
		items: await getChildren(userId, null),
		parents: [],
		title: "Tod",
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

async function getChildren(userId: number, parentId: number | null) {
	return await db
		.select({ id: todItem.id, title: todItem.title, state: todItem.state, dtStart: todItem.dtStart, dtEnd: todItem.dtEnd })
		.from(todItem)
		.where(basicWhere(userId, parentId ? eq(todItem.parentId, parentId) : isNull(todItem.parentId)))
		.orderBy(todItem.dtStart, desc(todItem.state), desc(todItem.id));
	// .toSQL().sql;
}

export async function checkIfItemBelongsUser(userId: number, itemId?: number | null) {
	if (itemId == null || itemId == 0) return true; //Root
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
	//TODO Do this date checks in db (before update trigger)
	if (item.dtStart && item.dtEnd && item.dtStart > item.dtEnd) {
		const d = item.dtStart;
		item.dtStart = item.dtEnd;
		item.dtEnd = d;
	}
	if (item.dtEnd && item.dtStart == item.dtEnd) item.dtEnd = null;

	await db
		.update(todItem)
		.set({ ...item, id: undefined, userId: undefined, parentId: item.parentId ? item.parentId : null })
		.where(and(eq(todItem.id, item.id), eq(todItem.userId, item.userId)));
}

/**
 * Check if parentId belongs to user before running this
 * @param item
 */
export async function insertItem(userId: number, parentId: number | null, title: string) {
	const d = await db.insert(todItem).values({ userId, parentId, title }).returning({ id: todItem.id }).get();
	return d.id;
}
