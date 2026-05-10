"use server";

import { randomUUID } from "crypto";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import * as authSchema from "@/db/auth-schema";
import { db } from "@/db";
import { projectMembers, projects, tasks } from "@/db/schema";
import { createSlug } from "@/lib/slug";
import { canManageProject } from "@/lib/rbac";
import { requireCurrentSession } from "@/lib/session";

const createProjectSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().max(240).optional().or(z.literal("")),
  color: z.string().min(3).max(24).optional().or(z.literal("")),
});

const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(3).max(120),
  description: z.string().max(300).optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional().or(z.literal("")),
  assignedToId: z.string().optional().or(z.literal("")),
});

const updateAssigneeSchema = z.object({
  taskId: z.string().min(1),
  assignedToId: z.string().optional().or(z.literal("")),
});

const addMemberSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

const updateTaskSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(["todo", "in_progress", "done"]),
});

async function ensureProjectAdmin(projectId: string, userId: string) {
  const userRow = await db.query.user.findFirst({
    where: eq(authSchema.user.id, userId),
  });

  const membership = await db.query.projectMembers.findFirst({
    where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)),
  });

  if (canManageProject(userRow?.role, membership?.role)) {
    // Return a synthetic membership to satisfy callers.
    return membership ?? { projectId, userId, role: "admin", createdAt: new Date() };
  }

  if (!membership) {
    throw new Error("You do not have access to this project.");
  }

  if (membership.role !== "admin") {
    throw new Error("Only project admins can perform this action.");
  }

  return membership;
}

async function ensureProjectMember(projectId: string, userId: string) {
  const membership = await db.query.projectMembers.findFirst({
    where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)),
  });

  if (!membership) {
    throw new Error("You do not have access to this project.");
  }

  return membership;
}

export async function createProjectAction(formData: FormData) {
  const session = await requireCurrentSession();
  const parsed = createProjectSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    color: formData.get("color"),
  });

  const now = new Date();
  const projectId = randomUUID();
  const slug = createSlug(parsed.name);

  await db.insert(projects).values({
    id: projectId,
    name: parsed.name,
    slug,
    description: parsed.description || null,
    color: parsed.color || "indigo",
    ownerId: session.user.id,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(projectMembers).values({
    projectId,
    userId: session.user.id,
    role: "admin",
    createdAt: now,
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
}

export async function addMemberAction(formData: FormData) {
  const session = await requireCurrentSession();
  const parsed = addMemberSchema.parse({
    projectId: formData.get("projectId"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  await ensureProjectAdmin(parsed.projectId, session.user.id);

  const member = await db.query.user.findFirst({
    where: eq(authSchema.user.email, parsed.email),
  });

  if (!member) {
    throw new Error("No user exists with that email address.");
  }

  const existing = await db.query.projectMembers.findFirst({
    where: and(
      eq(projectMembers.projectId, parsed.projectId),
      eq(projectMembers.userId, member.id),
    ),
  });

  if (existing) {
    throw new Error("That member is already part of this project.");
  }

  await db.insert(projectMembers).values({
    projectId: parsed.projectId,
    userId: member.id,
    role: parsed.role,
    createdAt: new Date(),
  });

  revalidatePath(`/projects/${parsed.projectId}`);
}

export async function createTaskAction(formData: FormData) {
  const session = await requireCurrentSession();
  const parsed = createTaskSchema.parse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    assignedToId: formData.get("assignedToId"),
  });

  await ensureProjectMember(parsed.projectId, session.user.id);

  // If an assignee is provided, only project admins may assign tasks.
  if (parsed.assignedToId) {
    await ensureProjectAdmin(parsed.projectId, session.user.id);

    const assigneeMembership = await db.query.projectMembers.findFirst({
      where: and(eq(projectMembers.projectId, parsed.projectId), eq(projectMembers.userId, parsed.assignedToId)),
    });

    if (!assigneeMembership) {
      throw new Error("Assignee must be a member of the project.");
    }
  }

  const now = new Date();
  const dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;

  await db.insert(tasks).values({
    id: randomUUID(),
    projectId: parsed.projectId,
    title: parsed.title,
    description: parsed.description || null,
    status: "todo",
    priority: parsed.priority,
    dueDate,
    assignedToId: parsed.assignedToId || null,
    createdById: session.user.id,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath(`/projects/${parsed.projectId}`);
  revalidatePath("/dashboard");
}

export async function updateTaskAssigneeAction(formData: FormData) {
  const session = await requireCurrentSession();
  const parsed = updateAssigneeSchema.parse({
    taskId: formData.get("taskId"),
    assignedToId: formData.get("assignedToId"),
  });

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, parsed.taskId),
  });

  if (!task) throw new Error("Task not found.");

  await ensureProjectAdmin(task.projectId, session.user.id);

  if (parsed.assignedToId) {
    const assigneeMembership = await db.query.projectMembers.findFirst({
      where: and(eq(projectMembers.projectId, task.projectId), eq(projectMembers.userId, parsed.assignedToId)),
    });

    if (!assigneeMembership) {
      throw new Error("Assignee must be a member of the project.");
    }
  }

  await db
    .update(tasks)
    .set({ assignedToId: parsed.assignedToId || null, updatedAt: new Date() })
    .where(eq(tasks.id, parsed.taskId));

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/dashboard");
}

export async function updateTaskStatusAction(formData: FormData) {
  const session = await requireCurrentSession();
  const parsed = updateTaskSchema.parse({
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, parsed.taskId),
  });

  if (!task) {
    throw new Error("Task not found.");
  }

  await ensureProjectMember(task.projectId, session.user.id);

  await db
    .update(tasks)
    .set({
      status: parsed.status,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, parsed.taskId));

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/dashboard");
}
