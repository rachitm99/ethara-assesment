import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { account, session, user, verification } from "./auth-schema";
import { projectMembers, projects, tasks } from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
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
