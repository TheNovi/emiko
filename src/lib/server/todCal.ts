import { db } from "$lib/server/db";
import { todItem } from "$lib/server/db/schema";
import { and, eq, or, gte, lt, isNull, isNotNull, type SQLWrapper, lte } from "drizzle-orm";

/**
 * Main function
 * @param userId Id of current user
 * @param dateFrom Date of oldest events to return
 * @param dateTo Date of newest events to return
 * @returns List of events
 */
export async function getCal(userId: number, dateFrom: Date, dateTo: Date) {
	if (dateFrom >= dateTo) return [];
	console.debug("cal", userId, dateFrom, dateTo);
	//Get all events
	const q = db
		.select({
			id: todItem.id,
			title: todItem.title,
			state: todItem.state,
			dateFrom: todItem.dateFrom,
			dateTo: todItem.dateTo,
			dateCopyMode: todItem.dateCopyMode,
			dateCopyOffset: todItem.dateCopyOffset,
		})
		.from(todItem)
		.where(
			//prettier-ignore
			and(
				eq(todItem.userId, userId), isNull(todItem.deletedAt), //Basic
				isNotNull(todItem.dateFrom), lt(todItem.dateFrom, dateTo), //Is event, and is not in far future
				or(
					or(gte(todItem.dateFrom, dateFrom), and(isNotNull(todItem.dateTo), gte(todItem.dateTo, dateTo))), //Is in date range
					eq(todItem.dateCopyMode, 1) //Is before dateFrom, but has auto copy mode
				)
			)
		)
		.orderBy(todItem.dateFrom);
	type CalItem = Awaited<typeof q>[0] & { dateFrom: Date };
	const all = (await q) as CalItem[];
	//Process events
	//TODO

	console.debug(all);
	return all;
}
