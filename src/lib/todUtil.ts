import { DateTime } from "luxon";
import type { CallItem } from "./server/todCal";

export function getEdt(e: CallItem) {
	return e.dtEnd ? e.dtEnd.diff(e.dtStart) : {}; //TODO This doesn't work for dst. (its added to newly calculated date).
}

export function todNext(item: CallItem, orgBf: DateTime | undefined = undefined): CallItem | undefined {
	if (!item.rFreq) return;
	if (!orgBf) orgBf = item.dtStart;
	let df = item.dtStart;
	const edt = getEdt(item);
	switch (item.rFreq) {
		case 1:
			if (!item.rInterval) return;
			df = df.plus({ days: item.rInterval }); //Skip days
			break;
		case 2: //Week //TODO
			return;
		case 3:
			// console.log(item.title, df.toISO(), df.plus({ month: 1 }).toISO());
			if (!item.rInterval)
				// df.setMonth(df.getMonth() + 1, orgBf.getDate()); //Date of month
				df = df.plus({ month: 1 });
			else return; //Day of month (second friday, etc.)
			break;
		case 4:
			if (!item.rInterval) return;
			// df.setFullYear(df.getFullYear() + item.rInterval, orgBf.getMonth(), orgBf.getDate()); //Skip years
			df = df.plus({ year: item.rInterval }); //Skip days
			break;
		default:
			return;
	}
	if (item.rUntil && item.rUntil < df) return;
	return {
		...item,
		dtStart: df,
		dtEnd: item.dtEnd ? df.plus(edt) : null,
	};
}

export function todTaskComplete(item: CallItem) {
	if (!todIsTask(item)) return;
	switch (item.eventType) {
		case 1:
			const edt = getEdt(item);
			item.dtStart = DateTime.now().startOf("day"); //TODO Copy Time from dtStart
			if (item.dtEnd) item.dtEnd = item.dtStart.plus(edt);
			break;
		case 2:
			//TODO todNext until dtStart <= new Date()
			break;
	}
	const i = todNext(item);
	if (i) {
		item.dtStart = i.dtStart;
		item.dtEnd = i.dtEnd;
	} else {
		//Either doesn't repeat or hit rUntil
		item.state = 0;
	}
}

//TODO Type
export function todIsTask(item: { eventType: number; dtStart: any }) {
	return item.dtStart && (item.eventType === 1 || item.eventType === 2);
}
