"use client";

import { useEffect, useState } from "react";
import { BookOpen, ClipboardList, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api";
import { StatCard } from "@/components/admin/StatCard";

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    courses: 0,
    users: 0,
    exams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, u, e] = await Promise.all([
          api.get("/courses"),
          api.get("/users"),
          api.get("/exams"),
        ]);
        if (!cancelled) {
          setCounts({
            courses: Array.isArray(c.data) ? c.data.length : 0,
            users: Array.isArray(u.data) ? u.data.length : 0,
            exams: Array.isArray(e.data) ? e.data.length : 0,
          });
        }
      } catch {
        if (!cancelled) setCounts({ courses: 0, users: 0, exams: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Welcome to your academy
        </h2>
        <p className="text-sm text-[var(--lms-muted)]">
          Overview of activity — inspired by a calm, data-rich control center.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total courses"
          value={loading ? "—" : counts.courses}
          icon={BookOpen}
          accent="blue"
        />
        <StatCard
          label="Users"
          value={loading ? "—" : counts.users}
          icon={Users}
          accent="indigo"
          hint="+ enrolled learners & staff"
        />
        <StatCard
          label="Exams"
          value={loading ? "—" : counts.exams}
          icon={ClipboardList}
          accent="emerald"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.1)] lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Class pulse</h3>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              This week
            </span>
          </div>
          <div className="flex h-48 items-end justify-between gap-2 px-2">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 opacity-90 shadow-sm transition hover:opacity-100"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-medium uppercase text-slate-400">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Engagement trending up — keep publishing new modules.
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-blue-50/40 p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.1)]">
          <h3 className="font-semibold text-slate-900">Quick focus</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2 rounded-xl bg-white/80 px-3 py-2 shadow-sm">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
              Review unpublished courses
            </li>
            <li className="flex gap-2 rounded-xl bg-white/80 px-3 py-2 shadow-sm">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              Upload lesson assets to Content
            </li>
            <li className="flex gap-2 rounded-xl bg-white/80 px-3 py-2 shadow-sm">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-400" />
              Schedule exams for active cohorts
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
