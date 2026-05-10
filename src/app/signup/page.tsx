import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[.95fr_1.05fr]">
        <section className="rounded-4xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300">
            Team Task Manager
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Create your team workspace</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Start with one account, then create projects, add teammates, and manage delivery with clear ownership.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ["Fast setup", "Email/password authentication with Better Auth"],
              ["Railway ready", "Designed for the Turso free plan and Railway deployment"],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="font-medium text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-4xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl shadow-slate-950/10">
          <h2 className="text-2xl font-semibold">Create account</h2>
          <p className="mt-2 text-sm text-slate-600">Your new account will be signed in automatically.</p>
          <div className="mt-6">
            <AuthForm mode="signup" />
          </div>
          <p className="mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
