import { db } from "$lib/server/db";
import { todItem } from "$lib/server/db/schema";
import { and, eq, gte, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { DateTime } from "luxon";

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
		rUntil: todItem.rUntil, //TODO Test
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
 * @param dateFrom Lower date limit
 * @param dateTo Upper date limit (excluding self)
 * @returns List of events
 */
export async function getCal(userId: number, tz: string, dateFrom: DateTime, dateTo: DateTime) {
	if (dateFrom >= dateTo) return [];

	dateFrom = dateFrom.setZone(tz);
	dateTo = dateTo.setZone(tz);
	// console.debug("cal", userId, dateFrom, dateTo);
	//Get all events
	const all = (await queryAll.all({ userId, dateFrom: dateFrom.toUnixInteger(), dateTo: dateTo.toUnixInteger() })) as CallItem[];
	// const all = test;
	const out = parseCalls(all, tz, dateFrom, dateTo);
	// console.debug(out);
	return out;
}

//Exported for tests
export function parseCalls(calls: CallItem[], tz: string, dateFrom: DateTime, dateTo: DateTime) {
	return calls.filter((v) => {
		const e = parseItemToLuxon(v, tz);
		if (e.dtStart >= dateFrom || (e.dtEnd && e.dtEnd >= dateFrom)) return true; //Already in range
		switch (e.rFreq) {
			case 1: //Days
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

function parseItemToLuxon(e: CallItem, tz: string) {
	const c = { zone: tz };
	const dtStart = DateTime.fromJSDate(e.dtStart, c);
	const dtEnd = e.dtEnd ? DateTime.fromJSDate(e.dtEnd, c) : null;
	return {
		// id: e.id,
		name: e.title, //For debug
		rFreq: e.rFreq,
		rInterval: e.rInterval,
		dtStart,
		dtEnd,
		rUntil: e.rUntil ? DateTime.fromJSDate(e.rUntil, c) : null,
		edt: dtEnd ? dtEnd.diff(dtStart) : {}, //TODO This doesn't work for dst. (its added to newly calculated date). Also test it, if it even works
	};
}
type CallItemLuxon = ReturnType<typeof parseItemToLuxon>;

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

function rangeModeDay(e: CallItemLuxon, dateFrom: DateTime, dateTo: DateTime) {
	if (!e.rInterval) return false; //Days to skip
	//Check if diff between dateFrom and dateTo is larger than interval (if yes, then it must repeats).
	if ((!e.rUntil || e.rUntil >= dateTo) && e.rInterval < dateTo.diff(dateFrom, ["days"]).days) return true; //TODO Test these
	if (e.rUntil && e.rInterval <= e.rUntil.diff(dateFrom, ["days"]).days) return true;

	const offset = e.rInterval;
	const df = dateFrom.diff(e.dtStart, ["day"]).days;
	const f = Math.floor(df / offset) * offset;
	const ds = e.dtStart.plus({ day: f });

	return isBetweenRange(ds, ds.plus(e.edt), ds.plus({ day: offset }), e.rUntil, dateFrom, dateTo);
}

//Backup: slower, but more readable
// function rangeModeDay(e: CallItemLuxon, dateFrom: DateTime, dateTo: DateTime) {
// if (!e.rInterval) return false; //Days to skip
// //Check if diff between dateFrom and dateTo is larger than interval (if yes, then it must repeats).
// if ((!e.rUntil || e.rUntil >= dateTo) && e.rInterval < dateTo.diff(dateFrom, ["days"]).days) return true;
// if (e.rUntil && e.rInterval <= e.rUntil.diff(dateFrom, ["days"]).days) return true;

// 	let ds = e.dtStart;
// 	let dse = e.dtStart;
// 	do {
// 		ds = dse;
// 		dse = dse.plus({ day: e.rInterval });
// 	} while (dse.plus(e.edt) < dateFrom || (e.rUntil && dse >= e.rUntil));

// 	return isBetweenRange(ds, ds.plus(e.edt), dse, e.rUntil, dateFrom, dateTo);
// }

function rangeModeMonth(e: CallItemLuxon, dateFrom: DateTime, dateTo: DateTime) {
	if (!e.rInterval) {
		//Date of the month
		const d = e.dtStart.day;
		let ds = dateFrom;
		if (d < dateFrom.day) ds = ds.set({ day: d });
		else ds = ds.set({ month: dateFrom.month - 1, day: d });
		let nds = dateFrom;
		if (dateFrom.day <= d) nds = nds.set({ day: d });
		else nds = nds.set({ month: nds.month + 1, day: d });

		return isBetweenRange(ds, ds.plus(e.edt), nds, e.rUntil, dateFrom, dateTo);
	}
	return rangeModeMonthWeek(e, dateFrom, dateTo);
}

function rangeModeMonthWeek(e: CallItemLuxon, dateFrom: DateTime, dateTo: DateTime) {
	if (!e.rInterval) return false; //Day of the month
	//First friday, 4. sunday, last monday etc.
	return false;
}

function rangeModeYear(e: CallItemLuxon, dateFrom: DateTime, dateTo: DateTime) {
	if (!e.rInterval) return false; //Years to skip
	let ds = e.dtStart;
	const y = dateFrom.year - ds.year;
	ds = ds.set({ year: Math.floor(y / e.rInterval) * e.rInterval + ds.year });

	return isBetweenRange(ds, ds.plus(e.edt), ds.set({ year: ds.year + e.rInterval }), e.rUntil, dateFrom, dateTo);
}

/**
 *
 * @param ds Item.dateFrom from last repetition where Item.dateFrom < dateFrom
 * @param dse Item.dateEnd from last repetition where Item.dateFrom < dateFrom
 * @param nds Item.dateFrom from first repetition where nds >= dateFrom
 * @param rUntil Item.rUntil
 * @param dateFrom dateFrom
 * @param dateTo dateTo
 * @returns
 */
function isBetweenRange(ds: DateTime, dse: DateTime, nds: DateTime, rUntil: DateTime | null, dateFrom: DateTime, dateTo: DateTime) {
	if (rUntil) return (dse >= dateFrom && ds <= rUntil) || (nds < dateTo && nds <= rUntil);
	return dse >= dateFrom || nds < dateTo;
}
