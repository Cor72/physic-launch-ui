import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const fixed = (value: number) => Math.round(value * 100) / 100;

interface ArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  head?: number;
  width?: number;
  dashed?: boolean;
  className?: string;
}

/* Drawn rather than built on <marker>: marker ids are document-global, and
   the same scene renders in several places with different colours. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  head = 6,
  width = 1.5,
  dashed,
  className,
}: ArrowProps) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const baseX = x2 - head * cos;
  const baseY = y2 - head * sin;
  const spread = head * 0.5;

  return (
    <g className={className}>
      <line
        x1={fixed(x1)}
        y1={fixed(y1)}
        x2={fixed(baseX + cos)}
        y2={fixed(baseY + sin)}
        stroke="currentColor"
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? "3 3" : undefined}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M${fixed(x2)} ${fixed(y2)}L${fixed(baseX + spread * sin)} ${fixed(baseY - spread * cos)}L${fixed(baseX - spread * sin)} ${fixed(baseY + spread * cos)}Z`}
        fill="currentColor"
      />
    </g>
  );
}

/* Textbook hatching: short diagonal ticks on the solid side of a surface. */
export function HatchBelow({
  x1,
  x2,
  y,
  step = 8,
  length = 5,
}: {
  x1: number;
  x2: number;
  y: number;
  step?: number;
  length?: number;
}) {
  const ticks: string[] = [];
  for (let x = x1 + step; x <= x2 + 0.01; x += step) {
    ticks.push(`M${fixed(x)} ${fixed(y)}l${-length} ${length}`);
  }
  return (
    <path
      d={ticks.join("")}
      fill="none"
      strokeWidth="1"
      className="stroke-line-strong"
    />
  );
}

export function HatchLeft({
  x,
  y1,
  y2,
  step = 8,
  length = 5,
}: {
  x: number;
  y1: number;
  y2: number;
  step?: number;
  length?: number;
}) {
  const ticks: string[] = [];
  for (let y = y1 + step; y <= y2 + 0.01; y += step) {
    ticks.push(`M${fixed(x)} ${fixed(y)}l${-length} ${-length}`);
  }
  return (
    <path
      d={ticks.join("")}
      fill="none"
      strokeWidth="1"
      className="stroke-line-strong"
    />
  );
}

export function Label({
  x,
  y,
  children,
  anchor = "middle",
  size = 11,
  className,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  size?: number;
  className?: string;
}) {
  return (
    <text
      x={fixed(x)}
      y={fixed(y)}
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={size}
      className={cn("fill-current font-medium", className)}
    >
      {children}
    </text>
  );
}

/* Only ever used as the last run of a label, so the baseline shift never
   carries into following text. */
export function Sub({ children }: { children: ReactNode }) {
  return (
    <tspan dy="0.32em" fontSize="0.72em">
      {children}
    </tspan>
  );
}
