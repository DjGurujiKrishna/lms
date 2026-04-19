"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export function StudentTopBar({ title }: { title: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const initials =
    user?.name
      ?.split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md md:h-16 md:px-8 lg:px-10">
      <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 md:text-lg">
        {title}
      </h1>
      <div className="flex items-center gap-2 md:gap-4">
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white shadow-md shadow-orange-500/30"
          aria-hidden
        >
          {initials}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 md:text-sm"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
