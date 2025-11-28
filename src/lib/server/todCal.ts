import { db } from "$lib/server/db";
import { todItem } from "$lib/server/db/schema";
import { getEdt, todIsTask } from "$lib/todUtil";
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
		eventType: todItem.eventType, //TODO Tests
	})
	.from(todItem)
	.where(
		//prettier-ignore
		and(
			eq(todItem.userId, sql.placeholder('userId')), isNull(todItem.deletedAt), //Basic
			isNotNull(todItem.dtStart), lt(todItem.dtStart, sql.placeholder('dateTo')), //Is event, and is not in far future
			or(/*isNull(todItem.rFreq),*/ isNull(todItem.rUntil), gte(todItem.rUntil, sql.placeholder('dateFrom'))), //Until is in range
			or(
				isNotNull(todItem.rFreq), //Repeats
				or(gte(todItem.dtStart, sql.placeholder('dateFrom')), and(isNotNull(todItem.dtEnd), gte(todItem.dtEnd, sql.placeholder('dateFrom')))), //Is in date range
				and(gte(todItem.state, 1), or(eq(todItem.eventType, 1), eq(todItem.eventType, 2))), //Not repeating tasks
			)
		)
	)
	.orderBy(todItem.dtStart) //Is this necessary
	.prepare();

export type CallItem = Awaited<ReturnType<typeof queryAll.all>>[0] & { dtStart: DateTime };

/**
 * Main function
 * @param userId Id of current user
 * @param dateFrom Lower date limit
 * @param dateTo Upper date limit (excluding self)
 * @returns List of events
 */
export async function getCal(userId: number, tz: string, dateFrom: DateTime, dateTo: DateTime) {
	if (dateFrom >= dateTo) return { events: [], tasks: [] };

	dateFrom = dateFrom.setZone(tz);
	dateTo = dateTo.setZone(tz);

	// console.debug("cal", userId, dateFrom, dateTo);
	//Get all events
	const all = (await queryAll.all({ userId, dateFrom: dateFrom.toUnixInteger(), dateTo: dateTo.toUnixInteger() })) as CallItem[];
	const out = parseCalls(all, tz, dateFrom, dateTo);
	// console.debug(out);
	return out;
}

//Exported for tests
export function parseCalls(calls: CallItem[], tz: string, dateFrom: DateTime, dateTo: DateTime) {
	const today = DateTime.now().setZone(tz).startOf("day");
	const tasks: CallItem[] = [];
	const events: CallItem[] = [];
	for (const e of calls) {
		e.dtStart = e.dtStart.setZone(tz);
		if (e.dtEnd) e.dtEnd = e.dtEnd.setZone(tz);
		if (e.rUntil) e.rUntil = e.rUntil.setZone(tz);
		//Task
		if (todIsTask(e)) {
			if (e.dtStart.startOf("day") <= today) tasks.push(e);
			else events.push(e); //TODO Test. Should be already in range, thanks to sql query?
			continue;
		}
		//Event
		if (checkEvent(e, dateFrom, dateTo)) events.push(e);
	}
	return { events, tasks };
}

function checkEvent(e: CallItem, dateFrom: DateTime, dateTo: DateTime) {
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
}

function rangeModeDay(e: CallItem, dateFrom: DateTime, dateTo: DateTime) {
	if (!e.rInterval) return false; //Days to skip
	//Check if diff between dateFrom and dateTo is larger than interval (if yes, then it must repeats).
	if ((!e.rUntil || e.rUntil >= dateTo) && e.rInterval < dateTo.diff(dateFrom, ["days"]).days) return true; //TODO Test these
	if (e.rUntil && e.rInterval <= e.rUntil.diff(dateFrom, ["days"]).days) return true;

	const offset = e.rInterval;
	const df = dateFrom.diff(e.dtStart, ["day"]).days;
	const f = Math.floor(df / offset) * offset;
	const ds = e.dtStart.plus({ day: f });

	return isBetweenRange(ds, ds.plus(getEdt(e)), ds.plus({ day: offset }), e.rUntil, dateFrom, dateTo);
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

function rangeModeMonth(e: CallItem, dateFrom: DateTime, dateTo: DateTime) {
	if (!e.rInterval) {
		//Date of the month
		const d = e.dtStart.day;
		let ds = dateFrom;
		if (d < dateFrom.day) ds = ds.set({ day: d });
		else ds = ds.set({ month: dateFrom.month - 1, day: d });
		let nds = dateFrom;
		if (dateFrom.day <= d) nds = nds.set({ day: d });
		else nds = nds.set({ month: nds.month + 1, day: d });

		return isBetweenRange(ds, ds.plus(getEdt(e)), nds, e.rUntil, dateFrom, dateTo);
	}
	return rangeModeMonthWeek(e, dateFrom, dateTo);
}

function rangeModeMonthWeek(e: CallItem, dateFrom: DateTime, dateTo: DateTime) {
	if (!e.rInterval) return false; //Day of the month
	//First friday, 4. sunday, last monday etc.
	return false;
}

function rangeModeYear(e: CallItem, dateFrom: DateTime, dateTo: DateTime) {
	if (!e.rInterval) return false; //Years to skip
	let ds = e.dtStart;
	const y = dateFrom.year - ds.year;
	ds = ds.set({ year: Math.floor(y / e.rInterval) * e.rInterval + ds.year });

	return isBetweenRange(ds, ds.plus(getEdt(e)), ds.set({ year: ds.year + e.rInterval }), e.rUntil, dateFrom, dateTo);
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
