import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import styles from "./orbits.module.css";

interface Ring {
  rx: number;
  ry: number;
  planet?: { tone: "brand" | "gold"; size: number; half: number };
}

const RINGS: Ring[] = [
  { rx: 560, ry: 172, planet: { tone: "brand", size: 4.5, half: 14 } },
  { rx: 420, ry: 130, planet: { tone: "gold", size: 3.5, half: 10 } },
  { rx: 290, ry: 90 },
];

interface OrbitsProps {
  /* Gradient ids are document-global, so each instance needs its own. */
  id: string;
  tilt?: number;
  className?: string;
}

/* The logo's orbit, scaled up into a scene: a near side drawn in full, a far
   side faded back, and planets that dim as they pass behind. */
export function Orbits({ id, tilt = -13, className }: OrbitsProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 720"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none", className)}
    >
      <defs>
        <linearGradient id={`${id}-near`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" style={{ stopColor: "var(--brand)", stopOpacity: 0 }} />
          <stop offset="0.2" style={{ stopColor: "var(--brand)", stopOpacity: 0.7 }} />
          <stop offset="0.5" style={{ stopColor: "var(--star)", stopOpacity: 0.18 }} />
          <stop offset="0.8" style={{ stopColor: "var(--gold)", stopOpacity: 0.65 }} />
          <stop offset="1" style={{ stopColor: "var(--gold)", stopOpacity: 0 }} />
        </linearGradient>
        <radialGradient id={`${id}-planet`}>
          <stop offset="0" style={{ stopColor: "var(--star)", stopOpacity: 0.9 }} />
          <stop offset="1" style={{ stopColor: "var(--star)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <g transform={`translate(600 330) rotate(${tilt})`}>
        {RINGS.map((ring) => (
          <g key={ring.rx}>
            <ellipse
              rx={ring.rx}
              ry={ring.ry}
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1"
              opacity="0.55"
            />
            <path
              d={`M${-ring.rx} 0 A${ring.rx} ${ring.ry} 0 0 0 ${ring.rx} 0`}
              fill="none"
              stroke={`url(#${id}-near)`}
              strokeWidth="1.25"
            />
          </g>
        ))}
        {RINGS.filter((ring) => ring.planet).map(({ rx, ry, planet }) => (
          <g
            key={rx}
            className={styles.planetX}
            style={
              { "--rx": `${rx}px`, "--half": `${planet!.half}s` } as CSSProperties
            }
          >
            <g
              className={styles.planetY}
              style={
                { "--ry": `${ry}px`, "--half": `${planet!.half}s` } as CSSProperties
              }
            >
              <circle r={planet!.size * 4} fill={`url(#${id}-planet)`} opacity="0.35" />
              <circle
                r={planet!.size}
                className={planet!.tone === "gold" ? "fill-gold" : "fill-brand"}
              />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}
