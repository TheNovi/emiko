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
		dtStart: todItem.dtStart,
		dtEnd: todItem.dtEnd,
		rFreq: todItem.rFreq,
		rInterval: todItem.rInterval,
		rUntil: todItem.rUntil, //TODO Implement in checks
	})
	.from(todItem)
	.where(
		//prettier-ignore
		and(
			eq(todItem.userId, sql.placeholder('userId')), isNull(todItem.deletedAt), //Basic
			isNotNull(todItem.dtStart), lt(todItem.dtStart, sql.placeholder('dateTo')), //Is event, and is not in far future
			or(
				or(gte(todItem.dtStart, sql.placeholder('dateFrom')), and(isNotNull(todItem.dtEnd), gte(todItem.dtEnd, sql.placeholder('dateFrom')))), //Is in date range
				and(
					isNotNull(todItem.rFreq), //Is before dateFrom, but repeats
					or(
						isNull(todItem.rUntil), gte(todItem.rUntil, sql.placeholder('dateFrom')), //Until is in range
					),
				)
			)
		)
	)
	.orderBy(todItem.dtStart) //Is this necessary
	.prepare();

export type CallItem = Awaited<ReturnType<typeof queryAll.all>>[0] & { dtStart: Date };

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
	// const all = test;
	// console.debug(all);
	const out = parseCalls(all, dateFrom, dateTo);
	// console.debug(out);
	return out;
}

//Exported for tests
export function parseCalls(calls: CallItem[], dateFrom: Date, dateTo: Date) {
	return calls.filter((e) => {
		if (e.dtStart >= dateFrom || (e.dtEnd && e.dtEnd.getTime() >= dateFrom.getTime())) return true; //Already in range
		// console.debug("\n" + e.title);
		// pD(e.dateFrom.getTime(), e.dateTo);
		// console.log(" mode: ", e.dateCopyMode);
		switch (e.rFreq) {
			case 1: //Days //TODO Do this in select?
				return rangeModeDay(e, dateFrom, dateTo);
			case 2: //Weeks //TODO
				return false;
			case 3: //Month
				return rangeModeMonth(e, dateFrom, dateTo);
			case 4: //Years
				return rangeModeYear(e, dateFrom, dateTo);
			default:
				console.error("Tod getCal | Unknown dateCopyMode", e.rFreq);
				break;
		}
	});
}

const test: CallItem[] = [
	{
		id: 1,
		title: "20.7 + 7d",
		state: 0,
		rFreq: 1,
		rInterval: 7,
		rUntil: null,
		dtStart: new Date(2025, 7 - 1, 20),
		dtEnd: null,
	},
	{
		id: 2,
		title: "13.X",
		state: 0,
		rFreq: 3,
		rInterval: 0,
		rUntil: null,
		// dateFrom: new Date(2024, 4 - 1, 13),
		dtStart: new Date("2025-08-13T18:53:33.004Z"),
		dtEnd: null,
	},
	{
		id: 3,
		title: "20.8 + 2y",
		state: 0,
		rFreq: 4,
		rInterval: 2,
		rUntil: null,
		dtStart: new Date(2021, 8 - 1, 20),
		dtEnd: null,
	},
];

function rangeModeDay(e: CallItem, dateFrom: Date, dateTo: Date) {
	if (!e.rInterval) return false; //Days to skip
	const offset = e.rInterval * 24 * 60 * 60000;
	const ds = e.dtStart.getTime();
	const df = dateFrom.getTime() - ds;
	const f = Math.floor(df / offset) * offset + ds;

	// pD(f, e.dateTo);
	// pD(f + offset, e.dateTo);
	return isBetweenRange(f, f + offset, getEdt(e), dateFrom, dateTo);
}

function rangeModeMonth(e: CallItem, dateFrom: Date, dateTo: Date) {
	if (!e.rInterval) {
		//Date of the month
		const d = e.dtStart.getUTCDate();
		const ds = new Date(dateFrom);
		if (d < dateFrom.getUTCDate()) ds.setUTCDate(d);
		else ds.setMonth(dateFrom.getUTCMonth() - 1, d);
		const nds = new Date(dateFrom);
		if (dateFrom.getUTCDate() <= d) nds.setUTCDate(d);
		else nds.setUTCMonth(nds.getUTCMonth() + 1, d);

		return isBetweenRange(ds.getTime(), nds.getTime(), getEdt(e), dateFrom, dateTo);
	}
	return rangeModeMonthWeek(e, dateFrom, dateTo);
}

function rangeModeMonthWeek(e: CallItem, dateFrom: Date, dateTo: Date) {
	if (!e.rInterval) return false; //Day of the month
	//First friday, 4. sunday, last monday etc.
	return false;
}

function rangeModeYear(e: CallItem, dateFrom: Date, dateTo: Date) {
	if (!e.rInterval) return false; //Years to skip
	const ds = new Date(e.dtStart);
	const y = dateFrom.getUTCFullYear() - ds.getUTCFullYear();
	ds.setUTCFullYear(Math.floor(y / e.rInterval) * e.rInterval + ds.getUTCFullYear());
	const nds = new Date(ds);
	nds.setUTCFullYear(nds.getUTCFullYear() + e.rInterval);

	return isBetweenRange(ds.getTime(), nds.getTime(), getEdt(e), dateFrom, dateTo);
}

function getEdt(e: CallItem): number {
	if (!e.dtEnd) return 0;
	return e.dtEnd.getTime() - e.dtStart.getTime();
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
function isBetweenRange(ds: number, nds: number, edt: number, dateFrom: Date, dateTo: Date) {
	// pD(ds, edt, "ds");
	// pD(nds, edt, "nds");
	return ds + (edt ? edt : 0) >= dateFrom.getTime() || nds < dateTo.getTime();
}

//Debug
function pD(ds: number, de: number | null, text = "") {
	if (de) console.debug("", text, new Date(ds).toISOString(), new Date(ds + de).toISOString());
	else console.debug("", text, new Date(ds).toISOString());
}
