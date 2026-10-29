import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import styles from "./physics.module.css";
import { Arrow, fixed, Label } from "./primitives";

/* A positive charge entering a uniform field B pointing into the page (the
   textbook ×). F = qv × B points up at entry, so the charge turns
   counter-clockwise through a half circle and leaves on the reverse heading.
   With B out of the page (·) the same charge would turn the other way. */
const FIELD = { left: 128, right: 300, top: 18, bottom: 182 };
const ENTRY = { x: FIELD.left, y: 150 };
const START = { x: 26, y: ENTRY.y };
const RADIUS = 52;
const TURN = { x: ENTRY.x, y: ENTRY.y - RADIUS };
const LEG = ENTRY.x - START.x;
const EXIT_Y = ENTRY.y - RADIUS * 2;

const fieldDots: { x: number; y: number }[] = [];
for (let x = FIELD.left + 18; x < FIELD.right; x += 30) {
  for (let y = FIELD.top + 16; y < FIELD.bottom; y += 30) {
    fieldDots.push({ x, y });
  }
}

export function MagneticScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={cn("overflow-visible", className)} aria-hidden="true">
      <rect
        x={FIELD.left}
        y={FIELD.top}
        width={FIELD.right - FIELD.left}
        height={FIELD.bottom - FIELD.top}
        rx="10"
        strokeWidth="1"
        className="fill-brand/[0.05] stroke-brand/30"
      />
      <path
        d={fieldDots
          .map((dot) => `M${dot.x - 3.5} ${dot.y - 3.5}l7 7M${dot.x + 3.5} ${dot.y - 3.5}l-7 7`)
          .join("")}
        fill="none"
        strokeWidth="1.1"
        strokeLinecap="round"
        className="stroke-brand/45"
      />
      <Label x={FIELD.right - 14} y={FIELD.top + 16} className="text-brand" anchor="end">
        B
      </Label>

      <path
        d={`M${START.x} ${ENTRY.y}H${ENTRY.x}A${RADIUS} ${RADIUS} 0 0 0 ${ENTRY.x} ${EXIT_Y}H${START.x}`}
        fill="none"
        strokeWidth="1.25"
        strokeDasharray="4 5"
        className="stroke-gold opacity-70"
      />
      <path
        d={`M${ENTRY.x} ${ENTRY.y}V${TURN.y}`}
        strokeWidth="1"
        strokeDasharray="2 3"
        className="stroke-line-strong"
      />
      <circle cx={TURN.x} cy={TURN.y} r="2" className="fill-ink-faint" />
      {/* Left of the centre, outside the field: inside the half-disc it
          collided with the radius line and the arc. */}
      <Label x={TURN.x - 8} y={TURN.y} size={10} className="text-ink-faint" anchor="end">
        r = mv/qB
      </Label>

      <g className={styles.motionOnly}>
        <g transform={`translate(${START.x} ${ENTRY.y})`}>
          <g
            className={styles.turn}
            style={{ "--turn-origin": `${LEG}px ${-RADIUS}px` } as CSSProperties}
          >
            <g
              className={styles.travel}
              style={{ "--leg": `${LEG}px` } as CSSProperties}
            >
              <Arrow x1={0} y1={0} x2={34} y2={0} className="text-gold" width={2} />
              <g className={styles.lorentz}>
                <Arrow x1={0} y1={0} x2={0} y2={-28} className="text-brand" width={2} />
              </g>
              <circle r="11" className="fill-gold" opacity="0.15" />
              <circle r="6.5" className="fill-gold" />
              <path d="M-3 0h6M0 -3v6" strokeWidth="1.4" className="stroke-surface-2" />
            </g>
          </g>
        </g>
      </g>
      <Label x={START.x + 8} y={ENTRY.y + 18} size={10} className="text-ink-faint" anchor="start">
        +q
      </Label>
      <Label x={START.x + 8} y={fixed(EXIT_Y) - 14} size={10} className="text-ink-faint" anchor="start">
        出射
      </Label>
    </svg>
  );
}
