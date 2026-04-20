"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const titles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "Users",
  "/admin/courses": "Courses",
  "/admin/subjects": "Subjects",
  "/admin/content": "Content",
  "/admin/exams": "Exams",
};

export function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const title =
    Object.entries(titles).find(
      ([k]) => pathname === k || pathname.startsWith(k + "/"),
    )?.[1] ?? "Dashboard";

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-[var(--lms-border)] bg-white/90 px-6 backdrop-blur-md lg:px-10">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-sm text-[var(--lms-muted)]">
          Manage your institute in one place
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search..."
            className="h-10 w-56 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none ring-blue-500/30 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 lg:w-72"
          />
        </div>
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="max-w-[140px] truncate text-sm font-semibold text-slate-900">
              {user?.name}
            </p>
            <p className="max-w-[140px] truncate text-xs text-[var(--lms-muted)]">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
