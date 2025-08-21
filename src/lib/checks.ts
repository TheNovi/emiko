function checkValue(v: any, required = false) {
	return typeof v == "string" && (!required || v.trim());
}

export function checkName(name: any) {
	let e: string[] = [];
	if (!checkValue(name)) {
		e.push("Missing name field");
		return e;
	}
	name = name.trim();
	if (name.length > 50) e.push("Name is too long (max 50 characters)");
	return e;
}

export function checkPassword(pass: any) {
	let e: string[] = [];
	if (!checkValue(pass, true)) {
		e.push("Missing password field");
		return e;
	}
	pass = pass.trim();
	if (!pass.length) e.push("Missing password field");
	if (pass.length < 7) e.push("Password is too short (min 7 characters)");
	if (pass.length > 250) e.push("Password is too long (max 250 characters)");
	return e;
}

export function addError(error: string[], ...errors: (string | undefined)[]) {
	if (errors.length)
		errors.forEach((v) => {
			if (v) error.push(v);
		});
}
