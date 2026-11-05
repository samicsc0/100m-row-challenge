import {
  bigserial,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";

export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    projectId: varchar("project_id", { length: 50 }).notNull(),
    eventName: varchar("event_name", { length: 50 }).notNull(),
    userId: varchar("user_id", { length: 100 }).notNull(),
    payload: jsonb("payload").default("{}").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({ eventNameIdx: index("event_name_index").on(table.eventName) }),
);
