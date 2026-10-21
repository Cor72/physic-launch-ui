import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import styles from "./physics.module.css";
import { Arrow, fixed, HatchBelow, HatchLeft, Label, Sub } from "./primitives";

/* A stroboscopic photograph of horizontal projection: eight equal time
   intervals, so the x spacing is constant and the y spacing grows as 1:3:5…
   The flight occupies 70% of a 4.8s cycle (see physics.module.css). */
const ORIGIN = { x: 84, y: 54 };
const STEPS = 8;
const STEP_X = 42;
const HALF_G = 2.8125;
const GROUND = ORIGIN.y + HALF_G * STEPS * STEPS;
const VX_LENGTH = 32;
/* v_y / v_x at landing = 2·HALF_G·STEPS / STEP_X. */
const VY_LENGTH = (VX_LENGTH * 2 * HALF_G * STEPS) / STEP_X;

const exposures = Array.from({ length: STEPS + 1 }, (_, index) => ({
  x: ORIGIN.x + STEP_X * index,
  y: ORIGIN.y + HALF_G * index * index,
}));
const landing = exposures[STEPS];
const exposureClass = [
  styles.exposure0,
  styles.exposure1,
  styles.exposure2,
  styles.exposure3,
  styles.exposure4,
  styles.exposure5,
  styles.exposure6,
  styles.exposure7,
  styles.exposure8,
];

export function ProjectileScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 270"
      className={cn("overflow-visible", className)}
      aria-hidden="true"
    >
      <g strokeWidth="1" className="stroke-line" strokeDasharray="2 3">
        {exposures.slice(1).map((point) => (
          <g key={point.x}>
            <line x1={point.x} y1={ORIGIN.y} x2={point.x} y2={fixed(point.y)} />
            <line x1={ORIGIN.x} y1={fixed(point.y)} x2={point.x} y2={fixed(point.y)} />
          </g>
        ))}
      </g>

      <line
        x1={ORIGIN.x}
        y1={ORIGIN.y}
        x2={452}
        y2={ORIGIN.y}
        strokeWidth="1"
        className="stroke-line-strong"
      />
      <Arrow x1={446} y1={ORIGIN.y} x2={458} y2={ORIGIN.y} head={5} width={1} className="text-ink-faint" />
      <Label x={468} y={ORIGIN.y} className="text-ink-faint">
        x
      </Label>

      <line x1={20} y1={ORIGIN.y} x2={ORIGIN.x} y2={ORIGIN.y} strokeWidth="1.5" className="stroke-ink-muted" />
      <line x1={ORIGIN.x} y1={ORIGIN.y} x2={ORIGIN.x} y2={GROUND} strokeWidth="1.5" className="stroke-ink-muted" />
      <HatchLeft x={ORIGIN.x} y1={ORIGIN.y} y2={GROUND} step={9} />
      <line x1={20} y1={GROUND} x2={460} y2={GROUND} strokeWidth="1.5" className="stroke-ink-muted" />
      <HatchBelow x1={ORIGIN.x} x2={460} y={GROUND} step={9} />

      <g className="fill-brand">
        {exposures.slice(1).map((point) => (
          <circle key={point.x} cx={point.x} cy={ORIGIN.y} r="2" />
        ))}
      </g>
      <g className="fill-gold">
        {exposures.slice(1).map((point) => (
          <circle key={point.x} cx={ORIGIN.x} cy={fixed(point.y)} r="2" />
        ))}
      </g>

      {/* Equal Δx between neighbouring exposures. */}
      <g className="text-ink-faint">
        <path
          d={`M${exposures[6].x} 44V40H${exposures[7].x}V44`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <Label x={(exposures[6].x + exposures[7].x) / 2} y={30} size={10}>
          Δx
        </Label>
      </g>

      <path
        d={`M${ORIGIN.x} ${ORIGIN.y}Q${(ORIGIN.x + landing.x) / 2} ${ORIGIN.y} ${landing.x} ${landing.y}`}
        fill="none"
        strokeWidth="1.25"
        strokeDasharray="4 5"
        className="stroke-brand opacity-60"
      />

      {exposures.map((point, index) => (
        <g
          key={point.x}
          className={cn("fill-gold", styles.exposure, exposureClass[index])}
        >
          <circle cx={point.x} cy={fixed(point.y)} r="9" opacity="0.16" />
          <circle cx={point.x} cy={fixed(point.y)} r="4.5" />
        </g>
      ))}

      <Arrow x1={ORIGIN.x} y1={ORIGIN.y} x2={ORIGIN.x + 40} y2={ORIGIN.y} className="text-gold" width={2} />
      <Label x={ORIGIN.x + 22} y={ORIGIN.y - 13} className="text-gold">
        v<Sub>0</Sub>
      </Label>

      <Arrow x1={432} y1={96} x2={432} y2={128} className="text-ink-faint" width={1.25} />
      <Label x={444} y={110} className="text-ink-faint">
        g
      </Label>

      <g className={styles.motionOnly} transform={`translate(${ORIGIN.x} ${ORIGIN.y})`}>
        <g className={styles.flightFade}>
          <g
            className={styles.flightX}
            style={{ "--flight-x": `${landing.x - ORIGIN.x}px` } as CSSProperties}
          >
            <g
              className={styles.flightY}
              style={{ "--flight-y": `${landing.y - ORIGIN.y}px` } as CSSProperties}
            >
              <circle r="13" className="fill-ink" opacity="0.1" />
              <Arrow x1={0} y1={0} x2={VX_LENGTH} y2={0} className="text-brand" />
              <Label x={VX_LENGTH + 10} y={-8} className="text-brand">
                v<Sub>x</Sub>
              </Label>
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={fixed(VY_LENGTH - 5)}
                strokeWidth="1.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className={cn("stroke-brand", styles.vyShaft)}
              />
              <g
                className={cn("text-brand", styles.vyHead)}
                style={{ "--vy-length": `${fixed(VY_LENGTH)}px` } as CSSProperties}
              >
                <path
                  d={`M0 ${fixed(VY_LENGTH)}L-3 ${fixed(VY_LENGTH - 6)}L3 ${fixed(VY_LENGTH - 6)}Z`}
                  fill="currentColor"
                />
                <Label x={10} y={VY_LENGTH - 2}>
                  v<Sub>y</Sub>
                </Label>
              </g>
              <circle r="5.5" className="fill-ink" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
