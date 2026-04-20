"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { StudentShell } from "@/components/student/StudentShell";

type Question = {
  id: string;
  question: string;
  options: unknown;
};

type ExamPayload = {
  id: string;
  title: string;
  duration: number;
  courseId: string;
  course?: { id?: string; name?: string };
  questions: Question[];
};

function parseOptions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((x) => String(x));
  return [];
}

export default function StudentExamTakePage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [exam, setExam] = useState<ExamPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"intro" | "active" | "done">("intro");
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingSec, setRemainingSec] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    correct: number;
    total: number;
  } | null>(null);

  const autoEndedRef = useRef(false);
  const submitLatestRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<ExamPayload>(`/exams/${examId}`);
      setExam(res.data);
      setRemainingSec(Number(res.data.duration) || 0);
    } catch {
      setExam(null);
      setError("Could not load this exam, or you are not enrolled.");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = useCallback(async () => {
    if (!exam || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{
        score: number;
        correct: number;
        total: number;
      }>("/submit", {
        examId: exam.id,
        answers,
        ...(startedAt ? { startedAt } : {}),
      });
      setResult({
        score: res.data.score,
        correct: res.data.correct,
        total: res.data.total,
      });
      setPhase("done");
    } catch (e: unknown) {
      const msg =
        typeof e === "object" &&
        e !== null &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: unknown } } }).response
          ?.data?.message === "string"
          ? String((e as { response: { data: { message: string } } }).response.data.message)
          : "Submit failed.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [exam, answers, startedAt, submitting]);

  submitLatestRef.current = submit;

  useEffect(() => {
    if (phase !== "active" || !startedAt || !exam) return;

    const tick = () => {
      const start = new Date(startedAt).getTime();
      const dur = Number(exam.duration) || 0;
      const elapsed = (Date.now() - start) / 1000;
      const left = Math.max(0, Math.floor(dur - elapsed));
      setRemainingSec(left);
      if (left <= 0 && !autoEndedRef.current && submitLatestRef.current) {
        autoEndedRef.current = true;
        void submitLatestRef.current();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, startedAt, exam]);

  function startExam() {
    autoEndedRef.current = false;
    const iso = new Date().toISOString();
    setStartedAt(iso);
    setPhase("active");
    if (exam) setRemainingSec(Number(exam.duration) || 0);
  }

  function formatClock(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const title = exam?.title ?? "Exam";

  const backHref = exam?.courseId
    ? `/student/courses/${exam.courseId}/exams`
    : "/student/courses";

  return (
    <StudentShell title={title}>
      <div className="mx-auto max-w-2xl space-y-6 pb-24">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to exams
        </Link>

        {loading ? (
          <p className="text-slate-500">Loading exam…</p>
        ) : !exam ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error ?? "Exam not available."}
          </div>
        ) : phase === "intro" ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900">{exam.title}</h2>
            {exam.course?.name && (
              <p className="mt-1 text-sm text-slate-500">{exam.course.name}</p>
            )}
            <p className="mt-4 text-sm text-slate-600">
              {exam.questions.length} question
              {exam.questions.length === 1 ? "" : "s"} · Time limit{" "}
              {formatClock(Number(exam.duration) || 0)} once you start.
            </p>
            <button
              type="button"
              onClick={startExam}
              className="mt-8 w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start exam
            </button>
          </div>
        ) : phase === "active" ? (
          <>
            <div className="sticky top-14 z-[5] flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur md:top-16">
              <span className="text-sm font-medium text-slate-700">
                Time left{" "}
                <span
                  className={
                    remainingSec <= 60 ? "font-bold text-red-600" : "font-semibold text-slate-900"
                  }
                >
                  {formatClock(remainingSec)}
                </span>
              </span>
              <button
                type="button"
                disabled={submitting}
                onClick={() => submit()}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit answers"}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <ol className="space-y-6">
              {exam.questions.map((q, idx) => {
                const opts = parseOptions(q.options);
                return (
                  <li
                    key={q.id}
                    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-slate-500">
                      Question {idx + 1}
                    </p>
                    <p className="mt-2 text-base font-medium text-slate-900">
                      {q.question}
                    </p>
                    <div className="mt-4 space-y-2">
                      {opts.map((opt) => (
                        <label
                          key={opt}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() =>
                              setAnswers((a) => ({ ...a, [q.id]: opt }))
                            }
                            className="h-4 w-4 border-slate-300 text-blue-600"
                          />
                          <span className="text-sm text-slate-800">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        ) : (
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-8 text-center shadow-inner">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              Exam submitted
            </h2>
            {result && (
              <p className="mt-2 text-lg text-slate-700">
                Your score:{" "}
                <span className="font-bold text-emerald-700">{result.score}%</span>
                <span className="text-slate-500">
                  {" "}
                  ({result.correct}/{result.total} correct)
                </span>
              </p>
            )}
            <button
              type="button"
              onClick={() => router.push("/student/results")}
              className="mt-8 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View all results
            </button>
          </div>
        )}
      </div>
    </StudentShell>
  );
}
