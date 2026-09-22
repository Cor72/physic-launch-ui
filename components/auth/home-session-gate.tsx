"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { createBrowserPlatformClient } from "@/lib/user-session";

export function HomeSessionGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const client = useMemo(() => createBrowserPlatformClient(), []);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    void client
      .GET("/api/user/v1/auth/me", { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        if (data) router.replace("/canvas");
        else setChecking(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, [client, router]);

  if (!checking) return children;
  return (
    <main className="bg-background text-foreground grid min-h-[100dvh] place-items-center px-4">
      <div className="w-full max-w-sm space-y-4" aria-label="正在确认登录状态">
        <div className="bg-muted h-3 w-28 animate-pulse rounded-md" />
        <div className="bg-muted h-9 w-56 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-full animate-pulse rounded-md" />
      </div>
    </main>
  );
}
