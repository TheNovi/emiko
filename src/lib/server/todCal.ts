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
					//TODO Test dateTo
					or(gte(todItem.dateFrom, sql.placeholder('dateFrom')), and(isNotNull(todItem.dateTo), sql`(date_from*1000+date_to) >= ${sql.placeholder('dateFrom')}`)), //Is in date range
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
	// const all = test; //TODO Proper tests
	// console.debug(all);
	//Process events
	const out: typeof all = all.filter((e) => {
		//TODO Test all of this!
		console.debug("\n" + e.title);
		pD(e.dateFrom.getTime(), e.dateTo);
		if (e.dateFrom >= dateFrom || (e.dateTo && e.dateFrom.getTime() + e.dateTo >= dateFrom.getTime())) return true; //Already in range
		console.log(" mode: ", e.dateCopyMode);
		switch (e.dateCopyMode) {
			case 1: //Days //TODO Do this in select?
				return rangeModeDay(e, dateFrom, dateTo);
			case 2: //Month
				return rangeModeMonth(e, dateFrom, dateTo);
			case 3: //Years
				return rangeModeYear(e, dateFrom, dateTo);
			default:
				console.error("Tod getCal | Unknown dateCopyMode", e.dateCopyMode);
				break;
		}
	});
	console.debug(out);
	return out;
}

const test: CallItem[] = [
	// {
	// 	id: 1,
	// 	title: "20.7 + 31*2d",
	// 	state: 0,
	// 	dateCopyMode: 1,
	// 	dateCopyOffset: 31 * 2,
	// 	dateFrom: new Date(2025, 7 - 1, 20),
	// 	dateTo: null, //TODO Test
	// },
	{
		id: 2,
		title: "13.X",
		state: 0,
		dateCopyMode: 10,
		dateCopyOffset: 0,
		dateFrom: new Date(2024, 4 - 1, 13),
		dateTo: null,
	},
	{
		id: 3,
		title: "20.8 + 2y",
		state: 0,
		dateCopyMode: 30,
		dateCopyOffset: 2,
		dateFrom: new Date(2021, 8 - 1, 20),
		dateTo: null,
	},
];

function rangeModeDay(e: CallItem, dateFrom: Date, dateTo: Date) {
	if (!e.dateCopyOffset) return false; //Days to skip
	const offset = e.dateCopyOffset * 24 * 60 * 60000;
	const ds = e.dateFrom.getTime();
	const df = dateFrom.getTime() - ds;
	const f = Math.floor(df / offset) * offset + ds;

	// pD(f, e.dateTo);
	// pD(f + offset, e.dateTo);
	return isBetweenRange(f, f + offset, e.dateTo, dateFrom, dateTo);
}

function rangeModeMonth(e: CallItem, dateFrom: Date, dateTo: Date) {
	if (e.dateCopyOffset == null) return false;
	if (e.dateCopyOffset == 0) {
		//Date of the month
		const d = e.dateFrom.getDate();
		const ds = new Date(dateFrom);
		if (d < dateFrom.getDate()) ds.setDate(d);
		else ds.setMonth(dateFrom.getMonth() - 1, d);
		const nds = new Date(dateFrom);
		if (dateFrom.getDate() <= d) nds.setDate(d);
		else nds.setMonth(nds.getMonth() + 1, d);

		return isBetweenRange(ds.getTime(), nds.getTime(), e.dateTo, dateFrom, dateTo);
	}
	return rangeModeMonthWeek(e, dateFrom, dateTo);
}

function rangeModeMonthWeek(e: CallItem, dateFrom: Date, dateTo: Date) {
	if (!e.dateCopyOffset) return false; //Day of the month
	//First friday, 4. sunday, last monday etc.
	return true;
}

function rangeModeYear(e: CallItem, dateFrom: Date, dateTo: Date) {
	if (!e.dateCopyOffset) return false; //Years to skip
	const ds = new Date(e.dateFrom);
	const y = dateFrom.getFullYear() - ds.getFullYear();
	ds.setFullYear(Math.floor(y / e.dateCopyOffset) * e.dateCopyOffset + ds.getFullYear());
	const nds = new Date(ds);
	nds.setFullYear(nds.getFullYear() + e.dateCopyOffset);

	return isBetweenRange(ds.getTime(), nds.getTime(), e.dateTo, dateFrom, dateTo);
}

/**
 *
 * @param ds Item.dateFrom from last repetition where Item.dateFrom < dateFrom
 * @param nds Item.dateFrom from first repetition where nds >= dateFrom
 * @param edt Item.dateTo
 * @param dateFrom dateFrom
 * @param dateTo dateTo
 * @returns
 */
function isBetweenRange(ds: number, nds: number, edt: number | null, dateFrom: Date, dateTo: Date) {
	// pD(ds, edt, "ds");
	// pD(nds, edt, "nds");
	return ds + (edt ? edt : 0) >= dateFrom.getTime() || nds < dateTo.getTime();
}

//Debug
function pD(ds: number, de: number | null, text = "") {
	if (de) console.debug("", text, new Date(ds).toISOString(), new Date(ds + de).toISOString());
	else console.debug("", text, new Date(ds).toISOString());
}
