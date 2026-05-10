import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_45%),linear-gradient(180deg,#f8fafc,#eef2ff_58%,#f8fafc)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-white/80 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600">
              Team Task Manager
            </p>
            <h1 className="text-sm font-medium text-slate-700">Simple. Clean. Role-aware.</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
            >
              Get started
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.1fr_.9fr]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              Built with Next.js, Better Auth, and Turso
            </span>
            <h2 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Manage projects, assign tasks, and keep delivery visible.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              A polished team task manager with email/password authentication, project-level access
              control, live status tracking, and a dashboard that highlights overdue work at a glance.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Start free
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Open dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["RBAC", "Admin and Member roles per project"],
                ["Tasks", "Assign work, set priorities, track status"],
                ["Dashboard", "See overdue and upcoming work instantly"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-4xl bg-indigo-300/20 blur-3xl" />
            <div className="rounded-4xl border border-white/80 bg-white/80 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                    Demo workspace
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">Launch-ready overview</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Live
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Overdue", "03", "text-rose-600", "bg-rose-50"],
                  ["In progress", "09", "text-amber-600", "bg-amber-50"],
                  ["Completed", "24", "text-emerald-600", "bg-emerald-50"],
                  ["Projects", "06", "text-indigo-600", "bg-indigo-50"],
                ].map(([label, value, color, bg]) => (
                  <div key={label} className={`rounded-3xl ${bg} p-5`}>
                    <p className="text-sm font-medium text-slate-600">{label}</p>
                    <p className={`mt-3 text-3xl font-semibold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {[
                  ["Website redesign", "In progress", "High priority"],
                  ["Launch checklist", "Todo", "Due tomorrow"],
                  ["Bug sweep", "Done", "Completed today"],
                ].map(([title, status, note]) => (
                  <div key={title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{title}</p>
                      <p className="text-sm text-slate-500">{note}</p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
