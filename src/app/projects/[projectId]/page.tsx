import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import {
  createTaskAction,
  updateTaskAssigneeAction,
  updateTaskStatusAction,
} from "@/app/actions";
import { getProjectDetail } from "@/lib/data";
import { requireCurrentSession } from "@/lib/session";

function badgeForStatus(status: string) {
  if (status === "done") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "in_progress") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function badgeForPriority(priority: string) {
  if (priority === "high") return "bg-rose-50 text-rose-700 border-rose-200";
  if (priority === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const session = await requireCurrentSession();

  if (!projectId) {
    return (
      <AppShell active="projects" user={{ name: session.user.name, email: session.user.email }}>
        <div className="rounded-4xl border border-white/80 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Invalid project</h2>
          <p className="mt-2 text-slate-500">Missing project identifier in request.</p>
          <Link href="/projects" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">
            Back to projects
          </Link>
        </div>
      </AppShell>
    );
  }

  const detail = await getProjectDetail(projectId, session.user.id);

  if (!detail) {
    return (
      <AppShell active="projects" user={{ name: session.user.name, email: session.user.email }}>
        <div className="rounded-4xl border border-white/80 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Project not found</h2>
          <p className="mt-2 text-slate-500">You may not have access to this project.</p>
          <Link href="/projects" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">
            Back to projects
          </Link>
        </div>
      </AppShell>
    );
  }

  const isAdmin = detail.canManage;
  const openTasks = detail.tasks.filter((task) => task.status !== "done").length;
  const doneTasks = detail.tasks.filter((task) => task.status === "done").length;

  return (
    <AppShell active="projects" user={{ name: session.user.name, email: session.user.email }}>
      <div className="space-y-6">
        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-700">
                  {detail.membership.role}
                </span>
                <p className="text-sm text-slate-500">Project workspace</p>
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950">{detail.project.name}</h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                {detail.project.description || "No project description has been added yet."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                ["Members", detail.members.length],
                ["Open", openTasks],
                ["Done", doneTasks],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{value as number}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Team members</h2>
                  <p className="mt-1 text-sm text-slate-500">Admins can manage members from the admin page.</p>
                </div>
                {isAdmin ? (
                  <Link
                    href={`/projects/${detail.project.id}/admin`}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Manage team
                  </Link>
                ) : null}
              </div>

              <div className="mt-5 space-y-3">
                {detail.members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-950">{member.name || member.email}</p>
                      <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isAdmin ? (
              <div className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">Create task</h2>
                <p className="mt-1 text-sm text-slate-500">Admins can add work items and assign them to a team member.</p>

                <form action={createTaskAction} className="mt-5 space-y-4">
                  <input type="hidden" name="projectId" value={detail.project.id} />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Task title</label>
                    <input
                      name="title"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
                      placeholder="Review design handoff"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
                      placeholder="Add acceptance criteria or notes"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                      <select
                        name="priority"
                        defaultValue="medium"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Due date</label>
                      <input
                        name="dueDate"
                        type="date"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Assignee</label>
                      <select
                        name="assignedToId"
                        defaultValue=""
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
                      >
                        <option value="">Unassigned</option>
                        {detail.members.map((member) => (
                          <option key={member.userId} value={member.userId}>
                            {member.name || member.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
                    Add task
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">Tasks assigned to you</h2>
                <p className="mt-1 text-sm text-slate-500">You can update the status of tasks assigned to you. Admins manage task creation and assignment.</p>
              </div>
            )}
          </div>

          <div className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Task board</h2>
            <div className="mt-5 space-y-4">
              {detail.tasks.length > 0 ? (
                detail.tasks.map((task) => (
                  <div key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-950">{task.title}</h3>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeForStatus(task.status)}`}>
                            {task.status.replace("_", " ")}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeForPriority(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{task.description || "No description"}</p>
                        <p className="mt-3 text-xs text-slate-500">
                          {task.dueDate ? `Due ${task.dueDate.toLocaleDateString()}` : "No due date"}
                        </p>
                        <div className="mt-2 text-sm text-slate-600">
                          {isAdmin ? (
                            <form action={updateTaskAssigneeAction} className="flex items-center gap-2">
                              <input type="hidden" name="taskId" value={task.id} />
                              <select
                                name="assignedToId"
                                defaultValue={task.assignedToId || ""}
                                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                              >
                                <option value="">Unassigned</option>
                                {detail.members.map((member) => (
                                  <option key={member.userId} value={member.userId}>
                                    {member.name || member.email}
                                  </option>
                                ))}
                              </select>
                              <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save</button>
                            </form>
                          ) : (
                            <p className="text-xs text-slate-500">{task.assigneeName ? `Assigned to ${task.assigneeName}` : "Unassigned"}</p>
                          )}
                        </div>
                      </div>

                      {isAdmin || task.assignedToId === session.user.id ? (
                        <form action={updateTaskStatusAction} className="flex min-w-55 gap-2">
                          <input type="hidden" name="taskId" value={task.id} />
                          <select
                            name="status"
                            defaultValue={task.status}
                            className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                          >
                            <option value="todo">Todo</option>
                            <option value="in_progress">In progress</option>
                            <option value="done">Done</option>
                          </select>
                          <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                            Save
                          </button>
                        </form>
                      ) : (
                        <div className="min-w-55 text-right text-xs text-slate-500">
                          Status can only be updated by the assignee or an admin.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
                  No tasks yet. Use the form on the left to create the first one.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
