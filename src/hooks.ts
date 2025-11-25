import type { Transport } from "@sveltejs/kit";
import { DateTime } from "luxon";

export const transport: Transport = {
	DateTime: {
		encode: (value) => value instanceof DateTime && [value.toISO(), value.zoneName || ""],
		decode: ([d, zone]) => DateTime.fromISO(d, { zone }),
		// decode: ([d, zone]) => {
		// 	const a = DateTime.fromISO(d, { zone });
		// 	console.log(d, zone, a);
		// 	return a;
		// },
	},
};
