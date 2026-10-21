import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import styles from "./physics.module.css";
import { Arrow, fixed, HatchBelow, HatchLeft, Label } from "./primitives";

/* A horizontal spring oscillator. The block, the spring's length, the
   restoring-force arrow and the x–t trace below all run on the same
   sine-eased half period, so they stay phase-locked. */
const WALL = 32;
const FLOOR = 112;
const REST_X = 168;
const AMPLITUDE = 36;
const HALF = 17;
const SPRING_Y = FLOOR - HALF;
const SPRING_LENGTH = REST_X - HALF - WALL;

const COILS = 9;
const coil = (() => {
  const lead = 10;
  const pitch = (SPRING_LENGTH - lead * 2) / (COILS * 2);
  let d = `M${WALL} ${SPRING_Y}h${lead}`;
  for (let index = 0; index < COILS * 2; index += 1) {
    d += `l${fixed(pitch)} ${index % 2 === 0 ? -8 : 8}`;
  }
  return `${d}h${lead}`;
})();

const TRACE = { x: 40, y: 172, width: 256, amplitude: 14 };
const trace = (() => {
  const points: string[] = [];
  for (let step = 0; step <= 64; step += 1) {
    const t = step / 64;
    points.push(
      `${fixed(TRACE.x + t * TRACE.width)} ${fixed(TRACE.y + TRACE.amplitude * Math.cos(2 * Math.PI * t))}`,
    );
  }
  return `M${points.join("L")}`;
})();

export function SpringScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={cn("overflow-visible", className)} aria-hidden="true">
      <line x1={WALL} y1={52} x2={WALL} y2={FLOOR} strokeWidth="1.5" className="stroke-ink-muted" />
      <HatchLeft x={WALL} y1={52} y2={FLOOR} />
      <line x1={WALL} y1={FLOOR} x2={300} y2={FLOOR} strokeWidth="1.5" className="stroke-ink-muted" />
      <HatchBelow x1={WALL} x2={300} y={FLOOR} />

      <g strokeWidth="1" className="stroke-line-strong">
        {[REST_X - AMPLITUDE, REST_X, REST_X + AMPLITUDE].map((x) => (
          <line key={x} x1={x} y1={60} x2={x} y2={FLOOR} strokeDasharray="2 3" />
        ))}
      </g>
      <g className="text-ink-faint">
        <Label x={REST_X - AMPLITUDE} y={50} size={10}>
          −A
        </Label>
        <Label x={REST_X} y={50} size={10}>
          O
        </Label>
        <Label x={REST_X + AMPLITUDE} y={50} size={10}>
          +A
        </Label>
      </g>

      <path
        d={coil}
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={cn("stroke-brand", styles.coil)}
        style={
          {
            "--coil-origin": `${WALL}px ${SPRING_Y}px`,
            "--coil-min": fixed((SPRING_LENGTH - AMPLITUDE) / SPRING_LENGTH),
            "--coil-max": fixed((SPRING_LENGTH + AMPLITUDE) / SPRING_LENGTH),
          } as CSSProperties
        }
      />

      <g
        className={styles.oscillate}
        style={{ "--amplitude": `${AMPLITUDE}px` } as CSSProperties}
      >
        <rect
          x={REST_X - HALF}
          y={FLOOR - HALF * 2}
          width={HALF * 2}
          height={HALF * 2}
          rx="3"
          strokeWidth="1.5"
          className="fill-gold/15 stroke-gold"
        />
        <g
          className={styles.restoring}
          style={{ "--force-origin": `${REST_X}px ${FLOOR - HALF}px` } as CSSProperties}
        >
          <Arrow x1={REST_X} y1={FLOOR - HALF} x2={REST_X + 32} y2={FLOOR - HALF} className="text-ink" width={2} />
        </g>
        <Label x={REST_X} y={FLOOR - HALF * 2 - 10} size={10} className="text-ink-muted">
          F = −kx
        </Label>
      </g>

      <line x1={TRACE.x} y1={TRACE.y} x2={TRACE.x + TRACE.width} y2={TRACE.y} strokeWidth="1" className="stroke-line" />
      <path d={trace} fill="none" strokeWidth="1.25" className="stroke-brand opacity-50" />
      <Label x={TRACE.x - 12} y={TRACE.y} size={10} className="text-ink-faint">
        x
      </Label>
      <Label x={TRACE.x + TRACE.width + 10} y={TRACE.y} size={10} className="text-ink-faint">
        t
      </Label>
      <g className={styles.motionOnly}>
        <g
          className={styles.traceX}
          style={{ "--trace-width": `${TRACE.width}px` } as CSSProperties}
        >
          <g
            className={styles.traceY}
            style={{ "--trace-height": `${TRACE.amplitude * 2}px` } as CSSProperties}
          >
            <circle cx={TRACE.x} cy={TRACE.y + TRACE.amplitude} r="3.5" className="fill-brand" />
          </g>
        </g>
      </g>
    </svg>
  );
}
