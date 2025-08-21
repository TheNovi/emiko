import { describe, expect, test } from 'vitest';
import { parseCalls } from './todCal';

function p(e: { df: string | Date | number; dt: number | null; offset: number | null }, dateFrom: string | Date | number, dateTo: string | Date | number, dateCopyMode: number, result: boolean) {
	const name = () => {
		let o = e.df + ' ';
		o += '+' + e.offset;
		switch (dateCopyMode) {
			case 1:
				o += 'd';
				break;
			case 2:
				o += 'm';
				break;
			case 3:
				o += 'y';
				break;
		}
		return o;
	};
	test(name(), () => {
		const o = parseCalls([{ id: 1, title: e.df + ' ' + e.offset, state: 1, dateCopyMode, dateCopyOffset: e.offset, dateFrom: new Date(e.df), dateTo: e.dt }], new Date(dateFrom), new Date(dateTo));
		expect(o.length > 0).toBe(result);
	});
}

//TODO More tests
//TODO Test dateTo

describe('parseCalls', () => {
	describe('Days', () => {
		const m = 1;
		p({ offset: 7, df: '2025-06-07T00:00:00.000Z', dt: null }, '2025-08-13T00:00:00.000Z', '2025-09-13T00:00:00.000Z', m, true);
	});
	describe('Month days', () => {
		const m = 2;
		p({ offset: 0, df: '2025-06-07T00:00:00.000Z', dt: null }, '2025-08-13T00:00:00.000Z', '2025-09-13T00:00:00.000Z', m, true);
	});
	describe('Years', () => {
		const m = 3;
		p({ offset: 1, df: '2024-09-07T00:00:00.000Z', dt: null }, '2025-08-13T00:00:00.000Z', '2025-09-13T00:00:00.000Z', m, true);
	});
});

// test('', () => {
// 	expect(true).toBeTruthy();
// });
