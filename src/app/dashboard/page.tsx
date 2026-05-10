import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { getDashboardData } from "@/lib/data";
import { requireCurrentSession } from "@/lib/session";

function statClass(color: string) {
  switch (color) {
    case "rose":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "emerald":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "amber":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
  }
}

export default async function DashboardPage() {
  const session = await requireCurrentSession();
  const { projectRows, taskRows, stats, upcoming } = await getDashboardData(session.user.id);

  return (
    <AppShell active="dashboard" user={{ name: session.user.name, email: session.user.email }}>
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Projects", stats.projects, "indigo"],
            ["Assigned tasks", stats.assignedTasks, "amber"],
            ["Completed", stats.completedTasks, "emerald"],
            ["Overdue", stats.overdueTasks, "rose"],
            ["All tasks", stats.tasks, "slate"],
          ].map(([label, value, color]) => (
            <div key={label as string} className={`rounded-3xl border p-5 shadow-sm ${statClass(color as string)}`}>
              <p className="text-sm font-medium opacity-80">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value as number}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Your projects</h2>
                <p className="mt-1 text-sm text-slate-500">Recent activity from the workspaces you can access.</p>
              </div>
              <Link href="/projects" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                New project
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {projectRows.length > 0 ? (
                projectRows.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">{project.name}</p>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                          {project.description || "No description added yet."}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {project.role}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center md:col-span-2">
                  <p className="text-lg font-semibold text-slate-900">No projects yet</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Create your first project to start assigning tasks and inviting teammates.
                  </p>
                  <Link
                    href="/projects"
                    className="mt-5 inline-flex rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Create project
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Upcoming work</h2>
              <div className="mt-5 space-y-3">
                {upcoming.length > 0 ? (
                  upcoming.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-medium text-slate-950">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500">Due {task.dueDate?.toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                    No upcoming tasks. Add one from a project to keep the team moving.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Progress snapshot</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Completed</span>
                  <span className="font-semibold text-slate-900">
                    {stats.tasks === 0 ? 0 : Math.round((stats.completedTasks / stats.tasks) * 100)}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${stats.tasks === 0 ? 0 : (stats.completedTasks / stats.tasks) * 100}%` }}
                  />
                </div>
                <p>
                  You currently have {stats.overdueTasks} overdue task{stats.overdueTasks === 1 ? "" : "s"} across {stats.projects} project{stats.projects === 1 ? "" : "s"}.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Recent tasks</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {taskRows.length > 0 ? (
              taskRows.slice(0, 6).map((task) => (
                <div key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{task.description || "No description"}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1 font-medium">{task.priority}</span>
                    {task.dueDate ? (
                      <span className="rounded-full bg-white px-3 py-1 font-medium">
                        Due {task.dueDate.toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500 lg:col-span-2">
                No tasks yet. Open a project to create and assign work.
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
