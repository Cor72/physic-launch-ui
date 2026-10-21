import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

import { cn } from "@/lib/utils";

/* The screen itself. The stock classes stacked three alpha borders
   (border/70, dark:border/5, dark:border-t/15) to compensate for a dark
   `--border` that was mixed at 88% lightness; with the token fixed, one
   hairline is enough. */
const mockupVariants = cva(
  "relative z-10 flex overflow-hidden border border-line/80 shadow-lg",
  {
    variants: {
      type: {
        mobile: "max-w-[350px] rounded-[42px]",
        responsive: "rounded-xl",
      },
    },
    defaultVariants: {
      type: "responsive",
    },
  },
);

export interface MockupProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mockupVariants> {}

function Mockup({ className, type, ...props }: MockupProps) {
  return (
    <div
      data-slot="mockup"
      className={cn(mockupVariants({ type, className }))}
      {...props}
    />
  );
}

/* The bezel around the screen — a physical instrument housing rather than a
   tinted border, so it keeps a visible edge on both themes. */
const frameVariants = cva(
  "relative z-10 flex overflow-hidden rounded-2xl border border-line/70 bg-surface-3/80 dark:bg-surface-2/70",
  {
    variants: {
      size: {
        small: "p-1.5",
        large: "p-3",
      },
    },
    defaultVariants: {
      size: "small",
    },
  },
);

export interface MockupFrameProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof frameVariants> {}

function MockupFrame({ className, size, ...props }: MockupFrameProps) {
  return (
    <div
      data-slot="mockup-frame"
      className={cn(frameVariants({ size, className }))}
      {...props}
    />
  );
}

export { Mockup, MockupFrame };
