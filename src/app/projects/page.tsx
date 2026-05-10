import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { createProjectAction } from "@/app/actions";
import { getAccessibleProjects } from "@/lib/data";
import { requireCurrentSession } from "@/lib/session";

export default async function ProjectsPage() {
  const session = await requireCurrentSession();
  const projects = await getAccessibleProjects(session.user.id);

  return (
    <AppShell active="projects" user={{ name: session.user.name, email: session.user.email }}>
      <div className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Create a project</h2>
          <p className="mt-2 text-sm text-slate-500">Admins own the project and can add teammates later.</p>

          <form action={createProjectAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Project name</label>
              <input
                name="name"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
                placeholder="Product launch 2026"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
                placeholder="Short context for the team"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Accent color</label>
              <select
                name="color"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
                defaultValue="indigo"
              >
                {[
                  ["indigo", "Indigo"],
                  ["emerald", "Emerald"],
                  ["amber", "Amber"],
                  ["rose", "Rose"],
                  ["slate", "Slate"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Create project
            </button>
          </form>
        </section>

        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Your projects</h2>
              <p className="mt-2 text-sm text-slate-500">Jump into a workspace to manage tasks and team members.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {projects.length} total
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {projects.length > 0 ? (
              projects.map((project) => (
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
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Create your first project to start collaborating.
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
