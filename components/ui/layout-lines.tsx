import * as React from "react";

import { cn } from "@/lib/utils";

/* Dashed guides on the content container's edges — the margin rules of a
   drafting sheet. Held back until lg: on a narrow viewport they land inside
   the text block instead of framing it. */
function LayoutLines({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-0 hidden lg:block",
        className,
      )}
      {...props}
    >
      <div className="max-w-container line-y line-dashed mx-auto h-full" />
    </div>
  );
}

export { LayoutLines };
