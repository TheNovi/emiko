import { describe, expect, test } from "vitest";
import { parseCalls } from "./todCal";

function p(
	e: { ds: string | Date | number; de: string | Date | number | null; interval: number | null; until: string | Date | number | null | undefined },
	dateFrom: string | Date | number,
	dateTo: string | Date | number,
	rFreq: number,
	result: boolean
) {
	const name = () => {
		let o = e.ds + " ";
		o += "+" + e.interval;
		switch (rFreq) {
			case 1:
				o += "d";
				break;
			case 2:
				o += "w";
				break;
			case 3:
				o += "m";
				break;
			case 4:
				o += "y";
				break;
		}
		return o;
	};
	test(name(), () => {
		const o = parseCalls(
			[
				{
					id: 1,
					title: e.ds + " " + e.interval,
					state: 1,
					rFreq,
					rInterval: e.interval,
					rUntil: e.until ? new Date(e.until) : null,
					dtStart: new Date(e.ds),
					dtEnd: e.de ? new Date(e.de) : null,
				},
			],
			new Date(dateFrom),
			new Date(dateTo)
		);
		expect(o.length > 0).toBe(result);
	});
}

//TODO More tests
//TODO Test dateTo

describe("parseCalls", () => {
	describe("Days", () => {
		const m = 1;
		p({ interval: 7, ds: "2025-06-07T00:00:00.000Z", de: null, until: null }, "2025-08-13T00:00:00.000Z", "2025-09-13T00:00:00.000Z", m, true);
	});
	describe("Month days", () => {
		const m = 3;
		p({ interval: 0, ds: "2025-06-07T00:00:00.000Z", de: null, until: null }, "2025-08-13T00:00:00.000Z", "2025-09-13T00:00:00.000Z", m, true);
	});
	describe("Years", () => {
		const m = 4;
		p({ interval: 1, ds: "2024-09-07T00:00:00.000Z", de: null, until: null }, "2025-08-13T00:00:00.000Z", "2025-09-13T00:00:00.000Z", m, true);
	});
});

// test('', () => {
// 	expect(true).toBeTruthy();
// });
