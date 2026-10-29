import * as React from "react";

import { cn } from "@/lib/utils";

function Footer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer"
      className={cn("text-foreground pt-16 pb-8", className)}
      {...props}
    />
  );
}

/* The brand block needs roughly half again the width of a link column to
   hold the operator and contact lines without wrapping mid-label, so the
   wide breakpoint is explicitly proportioned rather than an even 5-up. */
function FooterContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-content"
      className={cn(
        "grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-16",
        className,
      )}
      {...props}
    />
  );
}

function FooterColumn({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-column"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  );
}

function FooterBottom({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-bottom"
      className={cn(
        "border-line-subtle text-ink-faint mt-14 flex flex-col items-start justify-between gap-4 border-t pt-6 text-xs sm:flex-row sm:items-center",
        className,
      )}
      {...props}
    />
  );
}

export { Footer, FooterBottom, FooterColumn, FooterContent };
