import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { addMemberAction, removeMemberAction, updateMemberRoleAction } from "@/app/actions";
import { getProjectDetail } from "@/lib/data";
import { requireCurrentSession } from "@/lib/session";

export default async function ProjectAdminPage({ params }: { params: Promise<{ projectId: string }> }) {
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

  if (!detail.canManage) {
    return (
      <AppShell active="projects" user={{ name: session.user.name, email: session.user.email }}>
        <div className="rounded-4xl border border-white/80 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Access denied</h2>
          <p className="mt-2 text-slate-500">Only admins can manage project members.</p>
          <Link href={`/projects/${detail.project.id}`} className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">
            Back to project
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="projects" user={{ name: session.user.name, email: session.user.email }}>
      <div className="space-y-6">
        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">Admin panel</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage team members</h1>
              <p className="mt-2 text-sm text-slate-500">Add members, change roles, and remove members from this project.</p>
            </div>
            <Link href={`/projects/${detail.project.id}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              Back to project
            </Link>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Project members</h2>
            <div className="mt-5 space-y-3">
              {detail.members.map((member) => (
                <div key={member.userId} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{member.name || member.email}</p>
                      <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {member.role}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <form action={updateMemberRoleAction} className="flex flex-1 items-center gap-2">
                      <input type="hidden" name="projectId" value={detail.project.id} />
                      <input type="hidden" name="userId" value={member.userId} />
                      <select
                        name="role"
                        defaultValue={member.role}
                        className="min-w-40 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Update role</button>
                    </form>

                    <form action={removeMemberAction}>
                      <input type="hidden" name="projectId" value={detail.project.id} />
                      <input type="hidden" name="userId" value={member.userId} />
                      <button className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-white/80 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Add member</h2>
            <p className="mt-1 text-sm text-slate-500">Invite an existing user by email and choose their project role.</p>

            <form action={addMemberAction} className="mt-5 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <input type="hidden" name="projectId" value={detail.project.id} />
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Member email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-400"
                  placeholder="teammate@company.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
                <select
                  name="role"
                  defaultValue="member"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-400"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
                Add member
              </button>
            </form>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
