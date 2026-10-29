"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type TrafficSurface = "home" | "login" | "register";

const reportedPaths = new Set<string>();

function surfaceForPath(pathname: string): TrafficSurface | null {
  if (pathname === "/") return "home";
  if (pathname === "/login") return "login";
  if (pathname === "/register") return "register";
  return null;
}

function report(surface: TrafficSurface, pathname: string): void {
  if (reportedPaths.has(pathname)) return;
  reportedPaths.add(pathname);
  void fetch("/api/v3/traffic/visits", {
    method: "POST",
    credentials: "include",
    keepalive: true,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ surface }),
  }).catch(() => {
    // Analytics is best-effort and must never interfere with navigation or auth.
  });
}

export function TrafficVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const surface = surfaceForPath(pathname);
    if (!surface) return;
    if (document.visibilityState === "visible") {
      report(surface, pathname);
      return;
    }
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", onVisible);
      report(surface, pathname);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [pathname]);

  return null;
}
