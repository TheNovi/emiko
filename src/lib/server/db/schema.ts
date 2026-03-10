import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, customType, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";
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

const basicCols = {
	id: integer("id").primaryKey(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(UNIXEPOCH())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(UNIXEPOCH())`)
		.$onUpdate(() => new Date()),
	deletedAt: integer("deleted_at", { mode: "timestamp" }),
};
const basicColsWithUserId = {
	...basicCols,
	userId: integer("user_id")
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
		.notNull(),
};

//* Text length most likely does nothing, use it only for reference and enforce it on endpoint

//* Root
export const user = sqliteTable("user", {
	...basicCols,
	tz: text("tz", { length: 100 }).notNull().default(""),
	name: text("name", { length: 100 }).notNull().unique("user_name_unique"),
	password: text("password", { length: 100 }).notNull(),
});
export type User = typeof user.$inferSelect;

//* Stroll
export const stroll = sqliteTable("stroll", {
	...basicCols,
	name: text("name").default("").notNull(),
	region: text("region").default("").notNull(),
	tz: integer("tz"),
});
// export type Stroll = typeof stroll.$inferSelect;

//* Tod
export const todItem = sqliteTable("tod_item", {
	...basicColsWithUserId,
	parentId: integer("parent_id").references((): AnySQLiteColumn => todItem.id, {
		onDelete: "cascade",
		onUpdate: "cascade",
	}),
	title: text("title", { length: 250 }).notNull(),
	state: integer("state").notNull().default(1), //0 Done, 1 Open, 2 Process
	description: text("description", { length: 5000 }).notNull().default(""),
	place: text("place", { length: 250 }).notNull().default(""),
	//TODO url
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

//* Workout //TODO Better name
export const woMachine = sqliteTable("workout_machine", {
	...basicColsWithUserId,
	name: text("name", { length: 60 }).notNull(),
	text: text("text", { length: 250 }).notNull().default(""),
	reps: integer("reps").notNull().default(10), //Also used as duration (10min)
	sets: integer("sets").notNull().default(2),
	value: real("value").notNull().default(0), //50kg, 7km/h ...
	unit: integer("unit").notNull().default(0), //TODO As enum?
	// Okay, next two columns could and should be separate tables, ...but, that would be overkill (at least for foreseeable future).
	// Every machine is going to have 1 qr code.
	// And I am not going to struggle with tag's many-to-many rel. for max +-50 rows per user.
	qrCode: text("qr_code", { length: 250 }).notNull().default(""),
	tags: text("tags", { length: 250 }).notNull().default(""), //Space separated
});

export const woActivity = sqliteTable("workout_activity", {
	...basicColsWithUserId,
	machineId: integer("machineId")
		.references((): AnySQLiteColumn => woMachine.id, { onDelete: "cascade", onUpdate: "cascade" })
		.notNull(),
	//Actual activity values
	reps: integer("reps").notNull().default(10), //Also used as duration (10min)
	sets: integer("sets").notNull().default(2),
	value: real("value").notNull().default(0), //50kg, 7km/h ...
});
