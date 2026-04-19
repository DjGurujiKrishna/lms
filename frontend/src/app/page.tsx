"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { canAccessAdmin } from "@/lib/roles";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const finish = () => {
      const { token, user } = useAuthStore.getState();
      if (!token || !user) {
        router.replace("/login");
        return;
      }
      router.replace(
        canAccessAdmin(user.role) ? "/admin/dashboard" : "/student",
      );
    };

    const persist = useAuthStore.persist;
    if (persist?.onFinishHydration) {
      return persist.onFinishHydration(finish);
    }
    finish();
    return undefined;
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-slate-500">Loading workspace…</p>
      </div>
    </div>
  );
}
