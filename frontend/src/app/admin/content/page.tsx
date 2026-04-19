"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Film, FileUp, Link as LinkIcon } from "lucide-react";
import { ContentPreview } from "@/components/ContentPreview";
import { api } from "@/lib/api";

type Course = { id: string; name: string };
type Subject = { id: string; name: string };
type ContentRow = {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  subjectId: string;
};

type UploadForm = {
  title: string;
  type: "Video" | "PDF";
};

export default function ContentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [items, setItems] = useState<ContentRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<ContentRow | null>(null);

  const { register, handleSubmit, reset } = useForm<UploadForm>({
    defaultValues: { type: "PDF" },
  });

  const loadCourses = useCallback(async () => {
    const res = await api.get<Course[]>("/courses");
    const list = Array.isArray(res.data) ? res.data : [];
    setCourses(list);
    if (list.length && !courseId) setCourseId(list[0].id);
  }, [courseId]);

  const loadSubjects = useCallback(async () => {
    if (!courseId) return;
    const res = await api.get<Subject[]>(`/subjects?courseId=${courseId}`);
    setSubjects(Array.isArray(res.data) ? res.data : []);
    setSubjectId("");
  }, [courseId]);

  const loadContent = useCallback(async () => {
    if (!subjectId) {
      setItems([]);
      setPreview(null);
      return;
    }
    try {
      const res = await api.get<ContentRow[]>(
        `/contents?subjectId=${subjectId}`,
      );
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setPreview((prev) => {
        if (prev && data.some((x) => x.id === prev.id)) {
          return data.find((x) => x.id === prev.id) ?? null;
        }
        return data[0] ?? null;
      });
    } catch {
      setItems([]);
      setPreview(null);
    }
  }, [subjectId]);

  useEffect(() => {
    loadCourses().catch(() => {});
  }, [loadCourses]);

  useEffect(() => {
    loadSubjects().catch(() => {});
  }, [loadSubjects]);

  useEffect(() => {
    loadContent().catch(() => {});
  }, [loadContent]);

  async function onUpload(data: UploadForm) {
    if (!subjectId || !file) {
      setError("Choose a subject and file.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", data.title.trim());
      fd.append("subjectId", subjectId);
      fd.append("type", data.type);
      await api.post("/contents/upload", fd);
      reset({ title: "", type: data.type });
      setFile(null);
      await loadContent();
    } catch {
      setError("Upload failed. Check file type (PDF or video) and size.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Content library</h2>
        <p className="text-sm text-[var(--lms-muted)]">
          Upload lessons — preview video/PDF below; files live in S3 with
          CloudFront URLs.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-600">Course</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onUpload)}
        className="space-y-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-6"
      >
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <FileUp className="h-5 w-5 text-blue-600" />
          Upload asset
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-600">Title</label>
            <input
              {...register("title", { required: true })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="Lesson title"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Type</label>
            <select
              {...register("type")}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="PDF">PDF</option>
              <option value="Video">Video</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">File</label>
          <input
            type="file"
            accept="application/pdf,video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload to library"}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Film className="h-5 w-5 text-blue-600" />
            Uploaded items
          </h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {!subjectId ? (
            <li className="px-6 py-8 text-center text-slate-500">
              Select a subject to see content.
            </li>
          ) : items.length === 0 ? (
            <li className="px-6 py-8 text-center text-slate-500">
              No files yet for this subject.
            </li>
          ) : (
            items.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setPreview(row)}
                  className={`flex w-full flex-col gap-2 px-6 py-4 text-left transition sm:flex-row sm:items-center sm:justify-between ${
                    preview?.id === row.id ? "bg-blue-50/80" : "hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">{row.title}</p>
                    <p className="text-xs text-slate-500">{row.type}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                    <LinkIcon className="h-4 w-4" />
                    {preview?.id === row.id ? "Previewing" : "Preview"}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {preview && subjectId && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">Preview</h3>
          <ContentPreview
            title={preview.title}
            type={preview.type}
            fileUrl={preview.fileUrl}
          />
          <a
            href={preview.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Open in new tab
          </a>
        </div>
      )}
    </div>
  );
}
