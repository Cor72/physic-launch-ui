"use client";

import { type ComponentProps, useRef } from "react";

import { cn } from "@/lib/utils";

/* Writes the pointer position into CSS variables for the `spotlight`
   utility. No state, so moving the pointer never re-renders. */
export function Spotlight({
  className,
  onPointerMove,
  ...props
}: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={cn("spotlight", className)}
      onPointerMove={(event) => {
        const element = ref.current;
        if (element) {
          const bounds = element.getBoundingClientRect();
          element.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
          element.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
        }
        onPointerMove?.(event);
      }}
      {...props}
    />
  );
}
