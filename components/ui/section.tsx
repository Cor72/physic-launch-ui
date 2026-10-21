import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const sectionVariants = cva("relative scroll-mt-28 px-5 sm:px-8", {
  variants: {
    rhythm: {
      default: "py-24 sm:py-32 lg:py-36",
      compact: "py-16 sm:py-20 lg:py-24",
      tight: "py-10 sm:py-12",
      flush: "py-0",
    },
    rule: {
      none: "",
      bottom: "line-b",
      top: "line-t",
    },
  },
  defaultVariants: {
    rhythm: "default",
    rule: "none",
  },
});

function Section({
  className,
  rhythm,
  rule,
  ...props
}: React.ComponentProps<"section"> & VariantProps<typeof sectionVariants>) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ rhythm, rule }), className)}
      {...props}
    />
  );
}

/* White inset panel, using the same surface tokens as every section. */
function Band({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="band"
      data-surface="light"
      className={cn(
        "bg-surface-1 text-ink border-line relative isolate mx-2 scroll-mt-28 overflow-hidden rounded-[28px] border sm:mx-3",
        className,
      )}
      {...props}
    />
  );
}

function Container({
  className,
  width = "default",
  ...props
}: React.ComponentProps<"div"> & { width?: "default" | "measure" | "wide" }) {
  return (
    <div
      data-slot="container"
      className={cn(
        "mx-auto w-full",
        width === "default" && "max-w-container",
        width === "wide" && "max-w-container-lg",
        width === "measure" && "max-w-measure",
        className,
      )}
      {...props}
    />
  );
}

/* A figure index and a short gradient rule ahead of the section label, in
   the manner of a technical plate caption. */
function Eyebrow({
  index,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { index?: string }) {
  return (
    <div
      data-slot="eyebrow"
      className={cn("flex items-center gap-3", className)}
      {...props}
    >
      {index && (
        <span className="type-label numeral text-brand">FIG.{index}</span>
      )}
      <span
        aria-hidden="true"
        className="from-brand to-gold h-px w-8 shrink-0 bg-linear-to-r opacity-70"
      />
      <span className="type-label text-ink-muted">{children}</span>
    </div>
  );
}

function SectionHeader({
  className,
  align = "start",
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "center" }) {
  return (
    <div
      data-slot="section-header"
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
      {...props}
    />
  );
}

function SectionTitle({
  className,
  level = 2,
  ...props
}: React.ComponentProps<"h2"> & { level?: 1 | 2 | 3 }) {
  const Comp = `h${level}` as "h1" | "h2" | "h3";

  return (
    <Comp
      data-slot="section-title"
      className={cn(
        level === 1 ? "type-display" : "type-h1",
        "text-ink text-balance",
        className,
      )}
      {...props}
    />
  );
}

function SectionLede({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="section-lede"
      className={cn("type-lede text-ink-muted max-w-measure", className)}
      {...props}
    />
  );
}

export {
  Band,
  Container,
  Eyebrow,
  Section,
  SectionHeader,
  SectionLede,
  SectionTitle,
  sectionVariants,
};
