"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  BookOpen,
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";

type Course = { id: string; name: string; instituteId: string };

type Form = { name: string };

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Form>();

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<Course[]>("/courses");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Could not load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(data: Form) {
    setError(null);
    try {
      await api.post("/courses", { name: data.name.trim() });
      reset();
      await load();
    } catch {
      setError("Failed to create course.");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this course?")) return;
    setError(null);
    try {
      await api.delete(`/courses/${id}`);
      await load();
    } catch {
      setError("Could not delete course.");
    }
  }

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">All courses</h2>
          <p className="text-sm text-[var(--lms-muted)]">
            Curate modules like a catalog — drag-feel layout, polished rows.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onCreate)}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            {...register("name", { required: true })}
            placeholder="New course name"
            className="min-w-[200px] rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-400 focus:ring-4"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create new course
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-blue-500/20 focus:border-blue-400 focus:ring-4"
          />
        </div>
        <select className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none">
          <option>All categories…</option>
        </select>
        <select className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none">
          <option>All statuses…</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="py-12 text-center text-slate-500">Loading courses…</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-slate-500">No courses yet.</p>
        ) : (
          filtered.map((course, idx) => (
            <div
              key={course.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <span className="mt-1 text-xs font-medium text-slate-400">
                  {idx + 1}
                </span>
                <GripVertical className="mt-1 hidden h-5 w-5 text-slate-300 sm:block" />
                <div>
                  <p className="font-semibold text-slate-900">{course.name}</p>
                  <p className="mt-1 text-xs text-[var(--lms-muted)]">
                    Course workspace · institute-linked
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-emerald-600">Published</span>
                </label>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  aria-label="More"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(course.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
