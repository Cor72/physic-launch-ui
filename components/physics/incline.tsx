import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import styles from "./physics.module.css";
import { Arrow, fixed, HatchBelow, Label } from "./primitives";

/* A block accelerating down a rough 30° incline, with its forces resolved
   along and across the slope. */
const ANGLE = Math.PI / 6;
const BASE = { x: 44, y: 176 };
const FOOT = { x: 276, y: 176 };
const TOP = { x: 44, y: 176 - (FOOT.x - BASE.x) * Math.tan(ANGLE) };
const along = { x: Math.cos(ANGLE), y: Math.sin(ANGLE) };
const normal = { x: Math.sin(ANGLE), y: -Math.cos(ANGLE) };
const HALF = 15;
const SLIDE = 72;

const contact = {
  x: TOP.x + (FOOT.x - TOP.x) * 0.26,
  y: TOP.y + (FOOT.y - TOP.y) * 0.26,
};
const center = { x: contact.x + HALF * normal.x, y: contact.y + HALF * normal.y };
const at = (dx: number, dy: number) => ({ x: center.x + dx, y: center.y + dy });

const WEIGHT = 56;
const reaction = WEIGHT * Math.cos(ANGLE);
const forces = {
  weight: at(0, WEIGHT),
  normal: at(reaction * normal.x, reaction * normal.y),
  friction: at(-22 * along.x, -22 * along.y),
  parallel: at(WEIGHT * Math.sin(ANGLE) * along.x, WEIGHT * Math.sin(ANGLE) * along.y),
  perpendicular: at(-reaction * normal.x, -reaction * normal.y),
};

/* Equal-time marks: distance grows as t² under constant acceleration. */
const marks = [0, 1, 2, 3, 4, 5].map((step) => {
  const distance = SLIDE * (step / 5) ** 2;
  return { x: contact.x + distance * along.x, y: contact.y + distance * along.y };
});

export function InclineScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={cn("overflow-visible", className)} aria-hidden="true">
      <path
        d={`M${TOP.x} ${fixed(TOP.y)}L${FOOT.x} ${FOOT.y}L${BASE.x} ${BASE.y}Z`}
        className="fill-ink/[0.04] stroke-ink-muted"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1={20} y1={FOOT.y} x2={300} y2={FOOT.y} strokeWidth="1.5" className="stroke-ink-muted" />
      <HatchBelow x1={20} x2={300} y={FOOT.y} />

      <path
        d={`M${FOOT.x - 28} ${FOOT.y}A28 28 0 0 1 ${fixed(FOOT.x - 28 * along.x)} ${fixed(FOOT.y - 28 * along.y)}`}
        fill="none"
        strokeWidth="1"
        className="stroke-ink-faint"
      />
      <Label x={FOOT.x - 40} y={FOOT.y - 9} className="text-ink-faint">
        θ
      </Label>

      <g className="fill-brand">
        {marks.map((mark, index) => (
          <circle key={index} cx={fixed(mark.x)} cy={fixed(mark.y)} r="1.8" />
        ))}
      </g>

      <g className={styles.slideFade}>
        <g
          className={styles.slide}
          style={
            {
              "--slide-x": `${fixed(SLIDE * along.x)}px`,
              "--slide-y": `${fixed(SLIDE * along.y)}px`,
            } as CSSProperties
          }
        >
          <Arrow x1={center.x} y1={center.y} x2={forces.parallel.x} y2={forces.parallel.y} dashed width={1} className="text-ink-faint" />
          <Arrow x1={center.x} y1={center.y} x2={forces.perpendicular.x} y2={forces.perpendicular.y} dashed width={1} className="text-ink-faint" />

          <g transform={`translate(${fixed(center.x)} ${fixed(center.y)}) rotate(30)`}>
            <rect
              x={-HALF}
              y={-HALF}
              width={HALF * 2}
              height={HALF * 2}
              rx="3"
              strokeWidth="1.5"
              className="fill-gold/15 stroke-gold"
            />
          </g>

          <Arrow x1={center.x} y1={center.y} x2={forces.weight.x} y2={forces.weight.y} className="text-ink" />
          <Label x={forces.weight.x + 14} y={forces.weight.y - 4} className="text-ink">
            mg
          </Label>
          <Arrow x1={center.x} y1={center.y} x2={forces.normal.x} y2={forces.normal.y} className="text-brand" />
          <Label x={forces.normal.x + 7} y={forces.normal.y - 7} className="text-brand">
            N
          </Label>
          <Arrow x1={center.x} y1={center.y} x2={forces.friction.x} y2={forces.friction.y} className="text-gold" />
          <Label x={forces.friction.x - 7} y={forces.friction.y - 6} className="text-gold">
            f
          </Label>
          <circle cx={fixed(center.x)} cy={fixed(center.y)} r="2" className="fill-ink" />
        </g>
      </g>
    </svg>
  );
}
