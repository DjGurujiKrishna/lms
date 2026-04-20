import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "blue" | "indigo" | "emerald";
}) {
  const ring =
    accent === "blue"
      ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
      : accent === "indigo"
        ? "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30"
        : "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
      <div
        className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg ${ring}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-[var(--lms-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-xs font-medium text-emerald-600">{hint}</p>
      )}
    </div>
  );
}
