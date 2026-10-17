import { building } from "$app/env";
import { defineEnvVars } from "@sveltejs/kit/env";
import * as v from "valibot";

export const variables = defineEnvVars({
	JWT_SECRET: { schema: building ? v.optional(v.string()) : v.string() },
	DB_URL: { schema: building ? v.optional(v.string()) : v.string() },
	TZ: { public: true, schema: (value) => value ?? "utc" },
	APP_VERSION: { public: true, schema: (value) => process.env.npm_package_version },
});
