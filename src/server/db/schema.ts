// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  unique,
  integer,
  boolean,
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

export const eventOtp = createTable(
  "event_otp",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .references(() => events.id, { onDelete: "cascade" })
      .notNull(),
    otp: varchar("otp", { length: 6 }).notNull().unique(),
    oneTimeUse: boolean("one_time_use").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
    invalidAfter: timestamp("invalid_after")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP + interval '1 month'`),
  },
  (example) => ({
    otpIndex: index("event_otp_idx").on(example.otp),
  }),
);

export const member_type_enum = pgEnum("member_type", ["admin", "member"]);

export const event_members = createTable(
  "event_member",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .references(() => events.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    teamId: integer("team_id")
      .references(() => teams.id, { onDelete: "set default" })
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
      .references(() => events.id, { onDelete: "cascade" })
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
      .references(() => events.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (example) => ({
    nameIndex: index("tasks_idx").on(example.name),
    unique1: unique("task_name").on(example.name, example.eventId),
  }),
);

export const task_proof = createTable("task_proof", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  teamId: integer("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  eventId: integer("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  url: varchar("url", { length: 256 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt"),
});

export const task_completion_status = createTable(
  "task_completion_status",
  {
    id: serial("id").primaryKey(),
    taskId: integer("task_id")
      .references(() => tasks.id, { onDelete: "cascade" })
      .notNull(),
    teamId: integer("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    eventId: integer("event_id")
      .references(() => events.id, { onDelete: "cascade" })
      .notNull(),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at").default(sql`NULL`),
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

export const event_proofRelations = relations(task_proof, ({ one }) => ({
  tasks: one(tasks, {
    fields: [task_proof.taskId],
    references: [tasks.id],
  }),
  teams: one(teams, {
    fields: [task_proof.teamId],
    references: [teams.id],
  }),
  events: one(events, {
    fields: [task_proof.eventId],
    references: [events.id],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  event_members: many(event_members),
  teams: many(teams),
  eventOtp: many(eventOtp),
  task_proof: many(task_proof),
}));

export const eventOtpRelations = relations(eventOtp, ({ one }) => ({
  events: one(events, {
    fields: [eventOtp.eventId],
    references: [events.id],
  }),
}));

export const event_membersRelations = relations(event_members, ({ one }) => ({
  events: one(events, {
    fields: [event_members.eventId],
    references: [events.id],
  }),
  teams: one(teams, {
    fields: [event_members.teamId],
    references: [teams.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many, one }) => ({
  event_members: many(event_members),
  events: one(events, {
    fields: [teams.eventId],
    references: [events.id],
  }),
  task_proof: many(task_proof),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  events: one(events, {
    fields: [tasks.eventId],
    references: [events.id],
  }),
  task_proof: many(task_proof),
}));

export const taskCompletionStatusRelations = relations(
  task_completion_status,
  ({ one }) => ({
    tasks: one(tasks, {
      fields: [task_completion_status.taskId],
      references: [tasks.id],
    }),
    teams: one(teams, {
      fields: [task_completion_status.teamId],
      references: [teams.id],
    }),
    events: one(events, {
      fields: [task_completion_status.eventId],
      references: [events.id],
    }),
  }),
);
