import { db } from "@/db";
import * as authSchema from "@/db/auth-schema";
import { projectMembers, projects } from "@/db/schema";
import { eq } from "drizzle-orm";

async function debugRBAC() {
  console.log("=== RBAC Debug ===\n");

  // Get all users and their roles
  console.log("Users in database:");
  const users = await db.query.user.findMany();
  users.forEach((user) => {
    console.log(`  - ${user.email}: role='${user.role}'`);
  });

  console.log("\nProject members in database:");
  const allMembers = await db
    .select({
      projectId: projectMembers.projectId,
      userId: projectMembers.userId,
      role: projectMembers.role,
      email: authSchema.user.email,
      projectName: projects.name,
    })
    .from(projectMembers)
    .innerJoin(authSchema.user, eq(authSchema.user.id, projectMembers.userId))
    .innerJoin(projects, eq(projects.id, projectMembers.projectId));

  allMembers.forEach((member) => {
    console.log(
      `  - Project: ${member.projectName}, User: ${member.email}, Role: '${member.role}'`
    );
  });

  console.log("\n=== Summary ===");
  console.log(`Total users: ${users.length}`);
  console.log(`Total project members: ${allMembers.length}`);
  console.log(
    `Users with role='admin': ${users.filter((u) => u.role === "admin").length}`
  );
  console.log(
    `Project members with role='admin': ${allMembers.filter((m) => m.role === "admin").length}`
  );
}

debugRBAC().catch(console.error);
