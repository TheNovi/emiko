import type { CallItem } from "./server/todCal";

export function todNext(item: CallItem, orgBf: Date | undefined = undefined): CallItem | undefined {
	if (!item.rFreq) return;
	if (!orgBf) orgBf = item.dtStart;
	let df = new Date(item.dtStart);
	const edt = item.dtEnd ? new Date(item.dtEnd.getTime() - df.getTime()).getTime() : 0;
	switch (item.rFreq) {
		case 1:
			if (!item.rInterval) return;
			df.setDate(df.getDate() + item.rInterval); //Skip days
			break;
		case 2: //Week //TODO
			return;
		case 3:
			if (!item.rInterval)
				df.setMonth(df.getMonth() + 1, orgBf.getDate()); //Date of month
			else return; //Day of month (second friday, etc.)
			break;
		case 4:
			if (!item.rInterval) return;
			df.setFullYear(df.getFullYear() + item.rInterval, orgBf.getMonth(), orgBf.getDate()); //Skip years
			break;
		default:
			return;
	}
	if (item.rUntil && item.rUntil < df) return;
	return {
		...item,
		dtStart: df,
		dtEnd: edt ? new Date(df.getTime() + edt) : null,
	};
}

export function todTaskComplete(item: CallItem) {
	if (!todIsTask(item)) return;
	switch (item.eventType) {
		case 1:
			const edt = item.dtEnd ? new Date(item.dtEnd.getTime() - item.dtStart.getTime()).getTime() : 0;
			item.dtStart = new Date();
			item.dtStart.setHours(0, 0, 0, 0); //TODO Copy Time from dtStart
			if (edt) item.dtEnd = new Date(item.dtStart.getTime() + edt);
			break;
		case 2:
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

export function todIsTask(item: { eventType: number; dtStart: Date | null }) {
	return item.dtStart && (item.eventType === 1 || item.eventType === 2);
}
