import { random } from "$lib/util";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	//TODO Do this using switch on client
	const c = ["lorenz", "butterfly"];
	redirect(302, "/" + c[Math.floor(random(0, c.length))]);
}) satisfies PageServerLoad;
