"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Layers, Plus } from "lucide-react";
import { api } from "@/lib/api";

type Course = { id: string; name: string };
type Subject = { id: string; name: string; courseId: string };

type CreateForm = { name: string };

export default function SubjectsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<CreateForm>();

  const loadCourses = useCallback(async () => {
    try {
      const res = await api.get<Course[]>("/courses");
      const list = Array.isArray(res.data) ? res.data : [];
      setCourses(list);
      setCourseId((prev) =>
        prev && list.some((c) => c.id === prev)
          ? prev
          : (list[0]?.id ?? ""),
      );
    } catch {
      setError("Could not load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubjects = useCallback(async () => {
    if (!courseId) return;
    setError(null);
    try {
      const res = await api.get<Subject[]>(`/subjects?courseId=${courseId}`);
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSubjects([]);
      setError("Could not load subjects.");
    }
  }, [courseId]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  async function onCreate(data: CreateForm) {
    if (!courseId) return;
    setError(null);
    try {
      await api.post("/subjects", {
        name: data.name.trim(),
        courseId,
      });
      reset();
      await loadSubjects();
    } catch {
      setError("Failed to create subject.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Subjects</h2>
        <p className="text-sm text-[var(--lms-muted)]">
          Nest subjects under each course — layered learning paths.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Course</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <form
        onSubmit={handleSubmit(onCreate)}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      >
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            New subject
          </label>
          <input
            {...register("name", { required: true })}
            placeholder="e.g. Algebra I"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={!courseId}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add subject
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.1)]">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Layers className="h-5 w-5 text-blue-600" />
            Subject list
          </h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {loading ? (
            <li className="px-6 py-10 text-center text-slate-500">Loading…</li>
          ) : subjects.length === 0 ? (
            <li className="px-6 py-10 text-center text-slate-500">
              No subjects for this course.
            </li>
          ) : (
            subjects.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-6 py-4 transition hover:bg-blue-50/40"
              >
                <span className="font-medium text-slate-900">{s.name}</span>
                <span className="text-xs text-slate-400">{s.id.slice(0, 8)}…</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
