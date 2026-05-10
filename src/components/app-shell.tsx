"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type AppShellProps = {
  active?: "dashboard" | "projects";
  user: {
    name: string | null;
    email: string;
  };
  children: React.ReactNode;
};

export function AppShell({ active, user, children }: AppShellProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_40%),linear-gradient(180deg,#f8fafc,#eef2ff_52%,#f8fafc)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
              Team Task Manager
            </p>
            <h1 className="text-lg font-semibold text-slate-950">Project control center</h1>
          </div>

          <nav className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <Link
              href="/dashboard"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                active === "dashboard"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                active === "projects"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              Projects
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name ?? "Member"}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              onClick={async () => {
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login");
                    },
                  },
                });
              }}
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
