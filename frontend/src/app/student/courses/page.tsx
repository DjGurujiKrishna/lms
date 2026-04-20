"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Layers } from "lucide-react";
import { api } from "@/lib/api";
import { StudentShell } from "@/components/student/StudentShell";

type Subject = { id: string; name: string };
type CourseBlock = {
  enrollmentId: string;
  course: { id: string; name: string; subjects: Subject[] };
};

export default function StudentCoursesPage() {
  const [rows, setRows] = useState<CourseBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<CourseBlock[]>("/student/courses");
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRows([]);
      setError("Could not load your courses. You may need to be enrolled.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <StudentShell title="My courses">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-sm text-[var(--lms-muted)]">
          Courses your institute assigned — open a course to watch content or take
          exams.
        </p>

        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        <ul className="space-y-4">
          {loading ? (
            <li className="rounded-3xl border border-slate-100 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
              Loading your courses…
            </li>
          ) : rows.length === 0 ? (
            <li className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
              No enrollments yet. Ask your teacher to enroll you in a course.
            </li>
          ) : (
            rows.map(({ course }, i) => (
              <li
                key={course.id}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.15)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-xs font-medium text-slate-400">
                      {i + 1}.
                    </span>
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        {course.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {course.subjects.length} subject
                        {course.subjects.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/student/courses/${course.id}/learn`}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700"
                    >
                      Watch content
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/student/courses/${course.id}/exams`}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Exams
                    </Link>
                  </div>
                </div>
                <ul className="divide-y divide-slate-100 px-5 py-2">
                  {course.subjects.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-2 py-3 text-sm text-slate-700"
                    >
                      <Layers className="h-4 w-4 shrink-0 text-slate-400" />
                      {s.name}
                    </li>
                  ))}
                </ul>
              </li>
            ))
          )}
        </ul>
      </div>
    </StudentShell>
  );
}
