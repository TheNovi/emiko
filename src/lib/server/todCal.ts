import { db } from "$lib/server/db";
import { todItem } from "$lib/server/db/schema";
import { and, eq, gte, isNotNull, isNull, lt, or, sql } from "drizzle-orm";

/**
 * Gets all events between dateFrom and dateTo, and all repeated events before dateFrom
 */
const queryAll = db
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
				eq(todItem.userId, sql.placeholder('userId')), isNull(todItem.deletedAt), //Basic
				isNotNull(todItem.dateFrom), lt(todItem.dateFrom, sql.placeholder('dateTo')), //Is event, and is not in far future
				or(
					or(gte(todItem.dateFrom, sql.placeholder('dateFrom')), and(isNotNull(todItem.dateTo), gte(todItem.dateTo, sql.placeholder('dateFrom')))), //Is in date range
					isNotNull(todItem.dateCopyOffset) //Is before dateFrom, but repeats
				)
			)
	)
	.orderBy(todItem.dateFrom) //Is this necessary
	.prepare();

type CallItem = Awaited<ReturnType<typeof queryAll.all>>[0] & { dateFrom: Date };

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
	const all = (await queryAll.all({ userId, dateFrom: Math.floor(dateFrom.getTime() / 1000), dateTo: Math.floor(dateTo.getTime() / 1000) })) as CallItem[];
	// console.debug(all);
	//Process events
	const out: typeof all = all.filter((e) => {
		//TODO Test all of this!
		//TODO Do this in select?
		if (e.dateFrom >= dateFrom || (e.dateTo && e.dateTo >= dateFrom)) return true; //Already in range
		if (!e.dateCopyOffset) return false; //Repeated event
		const df = dateFrom.getTime();
		const dt = dateTo.getTime();
		switch (e.dateCopyMode) {
			case 1: //Days
				//TODO Check if repeats e.dateFrom < datefrom and dateTo < e.dateTo (so if event is around range)
				return repeatsOffsetInRange(e.dateFrom.getTime(), e.dateCopyOffset * 24 * 60000, df, dt) || (e.dateTo && repeatsOffsetInRange(e.dateTo.getTime(), e.dateCopyOffset * 24 * 60000, df, dt));
			case 2: //Month //TODO
				//Check if repeats e.dateFrom < datefrom and dateTo < e.dateTo (so if event is around range)
				return true;
			case 3: //Years //TODO
				//Check if repeats e.dateFrom < datefrom and dateTo < e.dateTo (so if event is around range)
				return true;
			default:
				console.error("Tod getCal | Unknown dateCopyMode", e.dateCopyMode);
				break;
		}
	});
	console.debug(out);
	return out;
}

function repeatsOffsetInRange(itemDate: number, itemOffset: number, dateFrom: number, dateTo: number) {
	/*
		For example lets have params: 100, 20, 150, 155
		First offset everything by itemDateFrom (basically makes new dateFrom)
		x1 = 150 - 100 -> x1 = 50
		Then grab modulo
		50 % 20 -> 10
		And check if its between dateFrom and dateTo. Don't forget to first also offset dateFrom
		10 < (155 - 100) - 50
		10 < 5
	*/
	const x1 = dateFrom - itemDate;
	return x1 % itemOffset < dateTo - itemDate - x1;
}
