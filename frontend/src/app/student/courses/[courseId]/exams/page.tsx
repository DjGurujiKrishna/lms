"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ClipboardList, Timer } from "lucide-react";
import { api } from "@/lib/api";
import { StudentShell } from "@/components/student/StudentShell";

type Exam = {
  id: string;
  title: string;
  courseId: string;
  duration: number;
};

export default function StudentCourseExamsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [courseName, setCourseName] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const coursesRes = await api.get<
        { course: { id: string; name: string } }[]
      >("/student/courses");
      const list = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      const hit = list.find((r) => r.course.id === courseId);
      setCourseName(hit?.course.name ?? "");

      const res = await api.get<Exam[]>(
        `/student/exams?courseId=${courseId}`,
      );
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch {
      setExams([]);
      setError("Could not load exams for this course.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m} min ${s}s` : `${s}s`;
  }

  return (
    <StudentShell title={courseName ? `Exams · ${courseName}` : "Exams"}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my courses
        </Link>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <ul className="space-y-3">
          {loading ? (
            <li className="rounded-3xl border border-slate-100 bg-white px-6 py-10 text-center text-slate-500">
              Loading exams…
            </li>
          ) : exams.length === 0 ? (
            <li className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
              No exams published for this course yet.
            </li>
          ) : (
            exams.map((ex) => (
              <li
                key={ex.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{ex.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Timer className="h-3.5 w-3.5" />
                      Time limit {formatDuration(ex.duration)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/student/exams/${ex.id}`}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Start exam
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </StudentShell>
  );
}
