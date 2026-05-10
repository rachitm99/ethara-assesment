import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { account, session, user, verification } from "./auth-schema";
import { projectMembers, projects, tasks } from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const bootstrapStatements = [
  `CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "role" text DEFAULT 'member' NOT NULL,
    "email_verified" integer DEFAULT false NOT NULL,
    "image" text,
    "created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unique" ON "user" ("email");`,
  `CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY NOT NULL,
    "expires_at" integer NOT NULL,
    "token" text NOT NULL,
    "created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    "updated_at" integer NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "user_id" text NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON UPDATE no action ON DELETE cascade
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "session_token_unique" ON "session" ("token");`,
  `CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("user_id");`,
  `CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY NOT NULL,
    "account_id" text NOT NULL,
    "provider_id" text NOT NULL,
    "user_id" text NOT NULL,
    "access_token" text,
    "refresh_token" text,
    "id_token" text,
    "access_token_expires_at" integer,
    "refresh_token_expires_at" integer,
    "scope" text,
    "password" text,
    "created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    "updated_at" integer NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON UPDATE no action ON DELETE cascade
  );`,
  `CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("user_id");`,
  `CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" integer NOT NULL,
    "created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");`,
  `CREATE TABLE IF NOT EXISTS "projects" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "description" text,
    "color" text DEFAULT 'indigo' NOT NULL,
    "owner_id" text NOT NULL,
    "created_at" integer NOT NULL,
    "updated_at" integer NOT NULL,
    FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON UPDATE no action ON DELETE cascade
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "projects_slug_unique" ON "projects" ("slug");`,
  `CREATE INDEX IF NOT EXISTS "projects_owner_idx" ON "projects" ("owner_id");`,
  `CREATE TABLE IF NOT EXISTS "project_members" (
    "project_id" text NOT NULL,
    "user_id" text NOT NULL,
    "role" text DEFAULT 'member' NOT NULL,
    "created_at" integer NOT NULL,
    PRIMARY KEY("project_id", "user_id"),
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON UPDATE no action ON DELETE cascade
  );`,
  `CREATE INDEX IF NOT EXISTS "project_members_user_idx" ON "project_members" ("user_id");`,
  `CREATE TABLE IF NOT EXISTS "tasks" (
    "id" text PRIMARY KEY NOT NULL,
    "project_id" text NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "status" text DEFAULT 'todo' NOT NULL,
    "priority" text DEFAULT 'medium' NOT NULL,
    "due_date" integer,
    "assigned_to_id" text,
    "created_by_id" text NOT NULL,
    "created_at" integer NOT NULL,
    "updated_at" integer NOT NULL,
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("assigned_to_id") REFERENCES "user"("id") ON UPDATE no action ON DELETE set null,
    FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON UPDATE no action ON DELETE cascade
  );`,
  `CREATE INDEX IF NOT EXISTS "tasks_project_idx" ON "tasks" ("project_id");`,
  `CREATE INDEX IF NOT EXISTS "tasks_assignee_idx" ON "tasks" ("assigned_to_id");`,
];

// Run bootstrap statements but avoid top-level await so tools like drizzle-kit can
// transpile this file in CommonJS mode. Errors are logged but do not crash the process.
client
  .batch(bootstrapStatements.map((statement) => ({ sql: statement })))
  .catch((err) => {
    // Non-fatal at build/migration time — log for visibility.
    console.error("DB bootstrap statements failed:", err);
  });

export const schema = {
  user,
  session,
  account,
  verification,
  projects,
  projectMembers,
  tasks,
};

export const db = drizzle(client, { schema });

export type Database = typeof db;
