// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  boolean,
  unique,
  integer,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `dare-night_${name}`);

export const events = createTable(
  "event",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (example) => ({
    nameIndex: index("events_idx").on(example.name),
  }),
);

export const member_type_enum = pgEnum("member_type", ["admin", "member"]);

export const event_members = createTable(
  "event_member",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .references(() => events.id)
      .notNull(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    teamId: integer("team_id")
      .references(() => teams.id)
      .default(sql`NULL`),
    role: member_type_enum("role").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (example) => ({
    eventIdIndex: index("event_members_idx").on(example.eventId),
    uniqueUser: unique("event_user").on(example.eventId, example.userId),
  }),
);

export const teams = createTable(
  "team",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    eventId: integer("event_id")
      .references(() => events.id)
      .notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (example) => ({
    nameIndex: index("teams_idx").on(example.name),
  }),
);

export const tasks = createTable(
  "task",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 256 }),
    eventId: integer("event_id")
      .references(() => events.id)
      .notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (example) => ({
    nameIndex: index("tasks_idx").on(example.name),
  }),
);

export const task_completion_status = createTable(
  "task_completion_status",
  {
    id: serial("id").primaryKey(),
    taskId: integer("task_id")
      .references(() => tasks.id)
      .notNull(),
    teamId: integer("team_id")
      .references(() => teams.id)
      .notNull(),
    eventId: integer("event_id")
      .references(() => events.id)
      .notNull(),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed").default(sql`NULL`),
    image_url: varchar("image_url", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (example) => ({
    taskIdIndex: index("task_completion_status_idx").on(example.taskId),
    uniqueTask: unique("task_team_event").on(
      example.taskId,
      example.teamId,
      example.eventId,
    ),
  }),
);
