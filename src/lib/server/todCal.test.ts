import { describe, expect, test } from "vitest";
import { parseCalls } from "./todCal";
import { DateTime } from "luxon";

const tz = "Europe/Prague"; //Random tz with DST
process.env.TZ = tz;

function p(e: { ds: DateTime; de: DateTime | null; interval: number | null; until: DateTime | null | undefined }, dateFrom: DateTime, dateTo: DateTime, rFreq: number, result: boolean) {
	const name = () => {
		let o = e.ds.toString() + " ";
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
					rUntil: e.until ? e.until.toJSDate() : null,
					dtStart: e.ds.toJSDate(),
					dtEnd: e.de ? e.de.toJSDate() : null,
				},
			],
			process.env.TZ || "",
			dateFrom,
			dateTo
		);
		expect(o.length > 0).toBe(result);
	});
}

//TODO More tests

describe("parseCalls", () => {
	describe("Config", () => {
		test("tz", () => {
			expect(process.env.TZ).toBe(tz);
			expect(DateTime.now().zoneName).toBe(tz);
		});
	});
	describe("Days", () => {
		const m = 1;
		p({ interval: null, ds: DateTime.local(2025, 1, 1), de: DateTime.local(2025, 1, 5), until: null }, DateTime.local(2025, 1, 5), DateTime.local(2025, 2, 5), m, true);
		p({ interval: 0, ds: DateTime.local(2025, 1, 1), de: null, until: null }, DateTime.local(2025, 1, 5), DateTime.local(2025, 2, 5), m, false);
		p({ interval: 7, ds: DateTime.local(2025, 6, 7), de: null, until: null }, DateTime.local(2025, 8, 13), DateTime.local(2025, 9, 13), m, true);
	});
	describe("Month days", () => {
		const m = 3;
		p({ interval: 0, ds: DateTime.local(2025, 6, 7), de: null, until: null }, DateTime.local(2025, 8, 13), DateTime.local(2025, 9, 8), m, true);
		p({ interval: 0, ds: DateTime.local(2025, 6, 7), de: null, until: null }, DateTime.local(2025, 8, 7), DateTime.local(2025, 9, 1), m, true);
		p({ interval: 0, ds: DateTime.local(2025, 6, 7), de: null, until: null }, DateTime.local(2025, 8, 8), DateTime.local(2025, 9, 1), m, false);
		p({ interval: 0, ds: DateTime.local(2025, 6, 7), de: null, until: null }, DateTime.local(2025, 8, 13), DateTime.local(2025, 9, 7), m, false);
	});
	describe("Years", () => {
		const m = 4;
		p({ interval: 1, ds: DateTime.local(2024, 9, 7), de: null, until: null }, DateTime.local(2025, 8, 13), DateTime.local(2025, 9, 13), m, true);
	});
});

// test('', () => {
// 	expect(true).toBeTruthy();
// });
