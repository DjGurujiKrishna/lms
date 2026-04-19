"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

/** Step 16 will expand this portal; placeholder for enrolled students after login. */
export default function StudentPortalPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-6 py-16">
      <div className="max-w-md rounded-3xl border border-white bg-white p-10 text-center shadow-xl shadow-blue-900/5">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Student portal</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Your courses, lessons, exams, and results will appear here (Step 16 —
          Student Dashboard).
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
