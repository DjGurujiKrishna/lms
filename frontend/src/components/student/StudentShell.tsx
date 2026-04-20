"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncAuthCookieFromStore, useAuthStore } from "@/lib/auth-store";
import { canAccessAdmin } from "@/lib/roles";
import { StudentSidebar } from "./StudentSidebar";
import { StudentTopBar } from "./StudentTopBar";

export function StudentShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    syncAuthCookieFromStore();
  }, []);

  useEffect(() => {
    if (user && canAccessAdmin(user.role)) {
      router.replace("/admin/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] md:flex-row">
      <StudentSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <StudentTopBar title={title} />
        <main className="flex-1 px-4 pb-10 pt-5 md:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
