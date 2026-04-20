"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncAuthCookieFromStore, useAuthStore } from "@/lib/auth-store";
import { canAccessAdmin } from "@/lib/roles";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    syncAuthCookieFromStore();
  }, []);

  useEffect(() => {
    if (user && !canAccessAdmin(user.role)) {
      router.replace("/student");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] md:flex-row">
      <AdminSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1 px-6 pb-10 pt-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
