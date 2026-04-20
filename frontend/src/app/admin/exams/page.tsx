"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ClipboardList, Clock, Plus } from "lucide-react";
import { api } from "@/lib/api";

type Course = { id: string; name: string };
type Exam = {
  id: string;
  title: string;
  courseId: string;
  duration: number;
};

type ExamForm = {
  title: string;
  duration: number;
};

type QuestionForm = {
  examId: string;
  question: string;
  options: string;
  answer: string;
};

export default function ExamsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState<string | null>(null);

  const examForm = useForm<ExamForm>({
    defaultValues: { duration: 3600 },
  });
  const qForm = useForm<QuestionForm>();

  const loadCourses = useCallback(async () => {
    const res = await api.get<Course[]>("/courses");
    const list = Array.isArray(res.data) ? res.data : [];
    setCourses(list);
    if (list.length && !courseId) setCourseId(list[0].id);
  }, [courseId]);

  const loadExams = useCallback(async () => {
    if (!courseId) return;
    setError(null);
    try {
      const res = await api.get<Exam[]>(`/exams?courseId=${courseId}`);
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch {
      setExams([]);
      setError("Could not load exams.");
    }
  }, [courseId]);

  useEffect(() => {
    loadCourses().catch(() => {});
  }, [loadCourses]);

  useEffect(() => {
    loadExams().catch(() => {});
  }, [loadExams]);

  async function onCreateExam(data: ExamForm) {
    if (!courseId) return;
    setError(null);
    try {
      await api.post("/exams", {
        title: data.title.trim(),
        courseId,
        duration: Number(data.duration),
      });
      examForm.reset({ title: "", duration: 3600 });
      await loadExams();
    } catch {
      setError("Failed to create exam.");
    }
  }

  async function onCreateQuestion(data: QuestionForm) {
    const opts = data.options
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (opts.length < 2) {
      setError("Need at least two comma-separated options.");
      return;
    }
    setError(null);
    try {
      await api.post("/questions", {
        examId: data.examId,
        question: data.question.trim(),
        options: opts,
        answer: data.answer.trim(),
      });
      qForm.reset({
        examId: data.examId,
        question: "",
        options: "",
        answer: "",
      });
    } catch {
      setError("Failed to add question.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Exams</h2>
        <p className="text-sm text-[var(--lms-muted)]">
          Build assessments with timers and MCQ items.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Course</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={examForm.handleSubmit(onCreateExam)}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Plus className="h-5 w-5 text-blue-600" />
            New exam
          </h3>
          <div className="space-y-3">
            <input
              {...examForm.register("title", { required: true })}
              placeholder="Exam title"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <input
                type="number"
                {...examForm.register("duration", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <span className="text-xs text-slate-500">seconds</span>
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create exam
            </button>
          </div>
        </form>

        <form
          onSubmit={qForm.handleSubmit(onCreateQuestion)}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 font-semibold text-slate-900">Add MCQ</h3>
          <div className="space-y-3">
            <select
              {...qForm.register("examId", { required: true })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">Select exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            <textarea
              {...qForm.register("question", { required: true })}
              placeholder="Question text"
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <input
              {...qForm.register("options", { required: true })}
              placeholder="Options (comma-separated)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <input
              {...qForm.register("answer", { required: true })}
              placeholder="Correct option (exact match)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-full border border-blue-200 bg-blue-50 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-100"
            >
              Add question
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            Exams in this course
          </h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {exams.length === 0 ? (
            <li className="px-6 py-10 text-center text-slate-500">
              No exams yet for this course.
            </li>
          ) : (
            exams.map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{e.title}</p>
                  <p className="text-xs text-slate-500">
                    Duration {Math.floor(e.duration / 60)} min · ID {e.id.slice(0, 8)}…
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Timer ready
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
