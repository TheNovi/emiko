import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";

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
	state: integer("state").notNull().default(1), //0 Done, 1 Open, 2 Process, ...stateSet
	// stateSet: idk("stateSet"), //List of other states
	description: text("description", { length: 5000 }).notNull().default(""),
	// Calendar stuff
	dateFrom: integer("date_from", { mode: "timestamp" }),
	dateTo: integer("date_to", { mode: "timestamp" }),
	dateCopyOffset: integer("date_copy_offset"), //As normal int?
	dateCopyMode: integer("date_copy_mode"), //Auto copy mode
});
// export type TodItem = typeof todItem.$inferSelect;
