import { and, desc, eq, inArray } from "drizzle-orm";

import * as authSchema from "@/db/auth-schema";
import { db } from "@/db";
import { projectMembers, projects, tasks } from "@/db/schema";

export async function getAccessibleProjects(userId: string) {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      description: projects.description,
      color: projects.color,
      ownerId: projects.ownerId,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(eq(projectMembers.userId, userId))
    .orderBy(desc(projects.updatedAt));

  return rows;
}

export async function getDashboardData(userId: string) {
  const projectRows = await getAccessibleProjects(userId);
  const projectIds = projectRows.map((project) => project.id);

  const taskRows =
    projectIds.length > 0
      ? await db
          .select({
            id: tasks.id,
            projectId: tasks.projectId,
            title: tasks.title,
            description: tasks.description,
            status: tasks.status,
            priority: tasks.priority,
            dueDate: tasks.dueDate,
            assignedToId: tasks.assignedToId,
            createdAt: tasks.createdAt,
            updatedAt: tasks.updatedAt,
          })
          .from(tasks)
          .where(inArray(tasks.projectId, projectIds))
          .orderBy(desc(tasks.updatedAt))
      : [];

  const totalTasks = taskRows.length;
  const completedTasks = taskRows.filter((task) => task.status === "done").length;
  const overdueTasks = taskRows.filter(
    (task) => task.dueDate && task.dueDate.getTime() < Date.now() && task.status !== "done",
  ).length;

  const upcoming = taskRows.filter(
    (task) => task.status !== "done" && task.dueDate && task.dueDate.getTime() >= Date.now(),
  );

  const assignedTasks = taskRows.filter((task) => task.assignedToId === userId).length;

  return {
    projectRows,
    taskRows,
    stats: {
      projects: projectRows.length,
      tasks: totalTasks,
      completedTasks,
      overdueTasks,
      assignedTasks,
    },
    upcoming: upcoming.slice(0, 5),
  };
}

export async function getProjectDetail(projectId: string, userId: string) {
  const membership = await db.query.projectMembers.findFirst({
    where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)),
  });

  if (!membership) {
    return null;
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    return null;
  }

  const members = await db
    .select({
      userId: projectMembers.userId,
      role: projectMembers.role,
      email: authSchema.user.email,
      name: authSchema.user.name,
      image: authSchema.user.image,
    })
    .from(projectMembers)
    .innerJoin(authSchema.user, eq(authSchema.user.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, projectId))
    .orderBy(desc(projectMembers.createdAt));

  const projectTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      assignedToId: tasks.assignedToId,
      createdById: tasks.createdById,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      assigneeName: authSchema.user.name,
      assigneeEmail: authSchema.user.email,
    })
    .from(tasks)
    .leftJoin(authSchema.user, eq(authSchema.user.id, tasks.assignedToId))
    .where(eq(tasks.projectId, projectId))
    .orderBy(desc(tasks.updatedAt));

  return {
    project,
    membership,
    members,
    tasks: projectTasks,
  };
}
