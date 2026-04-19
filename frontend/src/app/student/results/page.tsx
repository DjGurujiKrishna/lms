"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { api } from "@/lib/api";
import { StudentShell } from "@/components/student/StudentShell";

type ResultRow = {
  id: string;
  score: number;
  examId: string;
  exam: {
    id: string;
    title: string;
    courseId: string;
  };
};

export default function StudentResultsPage() {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<ResultRow[]>("/results");
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRows([]);
      setError("Could not load results.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <StudentShell title="Your results">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-sm text-[var(--lms-muted)]">
          Scores from exams you have submitted in this institute.
        </p>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-5 py-4">
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Exam history</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {loading ? (
              <li className="px-5 py-10 text-center text-slate-500">Loading…</li>
            ) : rows.length === 0 ? (
              <li className="px-5 py-12 text-center text-slate-500">
                No graded exams yet. Complete an exam to see your score here.
              </li>
            ) : (
              rows.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{r.exam.title}</p>
                    <p className="text-xs text-slate-500">Exam ID · {r.examId.slice(0, 8)}…</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
                    {r.score}%
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </StudentShell>
  );
}
