import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, customType, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { DateTime } from "luxon";

function getToggles<T extends readonly string[]>(name: string, keys: [...T]) {
	//Type copied from stackoverflow, have no idea what is this black magic
	type Toggles<T extends readonly string[]> = {
		[Key in T[number]]: boolean;
	};
	return customType<{ data: Toggles<T>; driverData: number; notNull: true; default: true }>({
		dataType: () => "integer",
		toDriver(value) {
			let exp = 1;
			let out = 0;
			for (const k of keys) {
				out |= value[k] ? exp : 0;
				exp *= 2;
			}
			return out;
		},
		fromDriver(value: number) {
			let exp = 1;
			let out: { [key: string]: boolean } = {};
			for (const k of keys) {
				out[k] = !!(value & exp);
				exp *= 2;
			}
			return out as Toggles<T>;
		},
	})(name)
		.notNull()
		.default(0 as any);
}

const LuxonDateTime = customType<{ data: DateTime; driverData: number }>({
	dataType() {
		return "integer";
	},
	toDriver(value) {
		return value.toSeconds();
	},
	fromDriver(value: number): DateTime {
		return DateTime.fromSeconds(value);
	},
});

const timestamps = {
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(UNIXEPOCH())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(UNIXEPOCH())`)
		.$onUpdate(() => new Date()),
	deletedAt: integer("deleted_at", { mode: "timestamp" }),
};

const basicCols = {
	id: integer("id").primaryKey(),
	...timestamps,
	userId: integer("user_id")
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
		.notNull(),
};

//* Text length most likely does nothing, use it only for reference and enforce it on endpoint

//* Root
export const user = sqliteTable(
	"user",
	{
		id: integer("id").primaryKey(),
		...timestamps,
		tz: text("tz", { length: 100 }).notNull().default(""),
		name: text("name", { length: 100 }).notNull().unique("user_name_unique"),
		password: text("password", { length: 100 }).notNull(),
	}
	// (table) => ({})
);
export type User = typeof user.$inferSelect;

//* Bob
export const bobImage = sqliteTable(
	"bob_image",
	{
		...basicCols,
		path: text("path", { length: 250 }).notNull(),
		type: text("type", { length: 50 }).notNull(),
		size: integer("size").notNull(),
		takenAt: integer("taken_at", { mode: "timestamp" }).notNull(),
		favorite: integer("favorite", { mode: "boolean" }).notNull().default(false),
		public: integer("public", { mode: "boolean" }).notNull().default(false), //TODO View
		description: text("description", { length: 5000 }).notNull().default(""),
		//TODO Geolocation
		//TODO Tags
	}
	// (table) => ({})
);
// export type BobImage = typeof bobImage.$inferSelect;

//* Stroll
export const stroll = sqliteTable("stroll", {
	id: integer("id").primaryKey(),
	...timestamps,
	name: text("name").default("").notNull(),
	region: text("region").default("").notNull(),
	tz: integer("tz"),
});
// export type Stroll = typeof stroll.$inferSelect;

export const todItem = sqliteTable("tod_item", {
	...basicCols,
	parentId: integer("parent_id").references((): AnySQLiteColumn => todItem.id, { onDelete: "cascade", onUpdate: "cascade" }),
	title: text("title", { length: 250 }).notNull(),
	state: integer("state").notNull().default(1), //0 Done, 1 Open, 2 Process
	description: text("description", { length: 5000 }).notNull().default(""),
	place: text("place", { length: 250 }).notNull().default(""),
	toggles: getToggles("toggles", ["pin"]),
	// Calendar stuff
	dtStart: LuxonDateTime("dt_start"),
	dtEnd: LuxonDateTime("dt_end"), //TODO Make as number of days. Or maybe as luxon interval string. Dst makes this very buggy
	rFreq: integer("r_freq"), //1=day, 2=weekly, 3=month, 4=year
	rInterval: integer("r_interval"),
	rUntil: LuxonDateTime("r_until"),
	//TODO Maybe as 2 toggles? "Task" and "Repeat from start date"
	eventType: integer("event_type").notNull().default(0), // 0=normal/not event 1=Task (repeat from date completed) 2=Task (repeat from dtStart)
});
// export type TodItem = typeof todItem.$inferSelect;
