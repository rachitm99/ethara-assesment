import { account, session, user, verification } from "./auth-schema";
import {
  integer,
  sqliteTable,
  text,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";

export const projectRoleValues = ["admin", "member"] as const;
export type ProjectRole = (typeof projectRoleValues)[number];

export const taskStatusValues = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof taskStatusValues)[number];

export const taskPriorityValues = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof taskPriorityValues)[number];

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    color: text("color").notNull().default("indigo"),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    ownerIdx: index("projects_owner_idx").on(table.ownerId),
  }),
);

export const projectMembers = sqliteTable(
  "project_members",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().$type<ProjectRole>().default("member"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
    userIdx: index("project_members_user_idx").on(table.userId),
  }),
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().$type<TaskStatus>().default("todo"),
    priority: text("priority").notNull().$type<TaskPriority>().default("medium"),
    dueDate: integer("due_date", { mode: "timestamp_ms" }),
    assignedToId: text("assigned_to_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    projectIdx: index("tasks_project_idx").on(table.projectId),
    assigneeIdx: index("tasks_assignee_idx").on(table.assignedToId),
  }),
);

export const authTables = {
  user,
  session,
  account,
  verification,
};

export type AppDatabaseSchema = typeof authTables & {
  projects: typeof projects;
  projectMembers: typeof projectMembers;
  tasks: typeof tasks;
};
