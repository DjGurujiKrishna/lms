"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, Sparkles } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";

const cards = [
  {
    href: "/student/courses",
    title: "My courses",
    desc: "Subjects, lessons, and materials enrolled for you.",
    accent: "from-emerald-400/90 to-teal-500",
    icon: BookOpen,
  },
  {
    href: "/student/results",
    title: "Results",
    desc: "Scores from completed quizzes and assessments.",
    accent: "from-violet-400/90 to-indigo-600",
    icon: ClipboardList,
  },
];

export default function StudentHomePage() {
  return (
    <StudentShell title="Your learning space">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/80 to-indigo-50 p-6 shadow-[0_20px_50px_-24px_rgba(37,99,235,0.35)] md:p-10">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm ring-1 ring-blue-100">
                <Sparkles className="h-3.5 w-3.5" />
                Today
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                What do you want to learn today?
              </h2>
              <p className="mt-2 max-w-lg text-sm text-slate-600 md:text-base">
                Pick up where you left off — watch lessons, take exams, and track
                progress in one calm, focused workspace.
              </p>
            </div>
            <Link
              href="/student/courses"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 md:self-center"
            >
              Go to courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {cards.map(({ href, title, desc, accent, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${accent} p-6 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl`}
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 transition group-hover:opacity-100" />
              <Icon className="relative mb-4 h-8 w-8 opacity-90" />
              <h3 className="relative text-lg font-bold">{title}</h3>
              <p className="relative mt-2 text-sm text-white/90">{desc}</p>
              <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                Open
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>
      </div>
    </StudentShell>
  );
}
