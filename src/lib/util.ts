//Forms

/**
 * Used for parsing Date variable to HTML Input element
 * @param d Input date
 * @returns Date in datetime-local format '2025-08-01T08:51'
 */
export function formParseInputDate(d: Date | null | undefined) {
	if (!d) return null;
	return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, -1); //TODO This have some problems when changing timezone in browser
	// return d.toISOString().slice(0, -1);
}

/**
 * Transforms forms dates to ISO timestamps
 * @param formData
 * @param fields Array of fields to transform
 */
export function formDatesToISO(formData: FormData, fields: string[]) {
	for (const f of fields) {
		const d = formData.get(f);
		if (d) formData.set(f, new Date(Date.parse(d.toString())).toISOString());
	}
}

//Other

export function random(min: number, max: number) {
	return min + Math.random() * (max - min);
}

export function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}
