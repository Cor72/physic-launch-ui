import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import styles from "./physics.module.css";
import { Arrow, Label } from "./primitives";

/* Uniform circular motion. Velocity is tangent and centripetal acceleration
   points at the centre; both are drawn in the rotating frame, so they stay
   correct for the whole revolution. */
const CENTER = { x: 160, y: 100 };
const RADIUS = 66;

export function CircularScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={cn("overflow-visible", className)} aria-hidden="true">
      <circle
        cx={CENTER.x}
        cy={CENTER.y}
        r={RADIUS}
        fill="none"
        strokeWidth="1.25"
        strokeDasharray="3 4"
        className="stroke-line-strong"
      />
      <circle cx={CENTER.x} cy={CENTER.y} r="2.5" className="fill-ink-muted" />
      <Label x={CENTER.x - 10} y={CENTER.y + 10} className="text-ink-faint">
        O
      </Label>

      <g
        className={styles.spin}
        style={{ "--spin-origin": `${CENTER.x}px ${CENTER.y}px` } as CSSProperties}
      >
        <line
          x1={CENTER.x}
          y1={CENTER.y}
          x2={CENTER.x + RADIUS}
          y2={CENTER.y}
          strokeWidth="1"
          className="stroke-ink-faint"
        />
        <Arrow x1={CENTER.x + RADIUS} y1={CENTER.y} x2={CENTER.x + RADIUS} y2={CENTER.y - 46} className="text-brand" width={2} />
        <Arrow x1={CENTER.x + RADIUS} y1={CENTER.y} x2={CENTER.x + RADIUS - 34} y2={CENTER.y} className="text-gold" width={2} />
        <circle cx={CENTER.x + RADIUS} cy={CENTER.y} r="12" className="fill-ink" opacity="0.1" />
        <circle cx={CENTER.x + RADIUS} cy={CENTER.y} r="6.5" className="fill-ink" />

        {/* Labels ride the rotation but counter-rotate to stay upright. */}
        <g transform={`translate(${CENTER.x + RADIUS + 12} ${CENTER.y - 40})`}>
          <g className={styles.counterSpin}>
            <Label x={0} y={0} className="text-brand">
              v
            </Label>
          </g>
        </g>
        <g transform={`translate(${CENTER.x + RADIUS - 22} ${CENTER.y - 12})`}>
          <g className={styles.counterSpin}>
            <Label x={0} y={0} className="text-gold">
              a
            </Label>
          </g>
        </g>
      </g>

      <path
        d={`M${CENTER.x + 22} ${CENTER.y}A22 22 0 0 0 ${CENTER.x + 15.6} ${CENTER.y - 15.6}`}
        fill="none"
        strokeWidth="1"
        className="stroke-ink-faint"
      />
      <Label x={CENTER.x + 34} y={CENTER.y - 12} size={10} className="text-ink-faint">
        ω
      </Label>
    </svg>
  );
}
