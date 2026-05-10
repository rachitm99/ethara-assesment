export default function Loading() {
  return (
    <div className="rounded-4xl border border-white/80 bg-white p-8 shadow-sm">
      <div className="h-8 w-56 animate-pulse rounded-full bg-slate-100" />
      <div className="mt-6 space-y-4">
        <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
        <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
      </div>
    </div>
  );
}
