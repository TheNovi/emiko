export function random(min: number, max: number) {
	return min + Math.random() * (max - min);
}

export function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}
