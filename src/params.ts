import { defineParams } from "@sveltejs/kit/params";
import * as v from "valibot";

export const params = defineParams({
	number: v.pipe(v.string(), v.toNumber()),
});
