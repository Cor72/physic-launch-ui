"use client";

import { type ComponentProps, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/* Pauses every CSS animation inside while it is off screen. The physics
   scenes loop forever, and SVG content repaints on every frame it animates. */
export function InViewMotion({
  className,
  paused = false,
  ...props
}: ComponentProps<"div"> & { paused?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let inView = false;
    const sync = () => {
      element.dataset.inView = String(inView && !document.hidden);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { rootMargin: "120px" },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-paused={paused}
      className={cn(
        "data-[in-view=false]:**:[animation-play-state:paused]!",
        "data-[paused=true]:**:[animation-play-state:paused]!",
        className,
      )}
      {...props}
    />
  );
}
