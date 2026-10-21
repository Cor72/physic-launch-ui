import { ChevronDownIcon } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/* A ball launched horizontally that keeps bouncing, losing a fixed share of
   its height at each impact. Horizontal speed is constant, so equal time
   steps are equal x steps and every arc is a true parabola. Drawn in a
   1200×240 viewBox; the trail runs from the upper left down to the right,
   leading the eye into the next section. */
const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 240;
const FLOOR = 214;
const START_X = 56;
const DROP = 150;
const RESTITUTION_SQUARED = 0.55;
const ARCS = 5;
const SPAN = 1088;

interface Arc {
  from: number;
  to: number;
  height: number;
  half: boolean;
}

function buildArcs(): Arc[] {
  const heights = [DROP];
  for (let index = 1; index <= ARCS; index++)
    heights.push(heights[index - 1] * RESTITUTION_SQUARED);
  /* Time to fall from h scales with √h; the first arc is only the fall. */
  const units = heights.map((h, index) => Math.sqrt(h) * (index === 0 ? 1 : 2));
  const scale = SPAN / units.reduce((sum, unit) => sum + unit, 0);
  let x = START_X;
  return heights.map((height, index) => {
    const from = x;
    x += units[index] * scale;
    return { from, to: x, height, half: index === 0 };
  });
}

const ARCS_DATA = buildArcs();
const END_X = ARCS_DATA[ARCS_DATA.length - 1].to;

const round = (value: number) => Math.round(value * 10) / 10;

/* Each parabola as one quadratic Bézier: the control point sits above the
   middle of the arc at twice the apex height. */
const TRAIL_PATH = ARCS_DATA.map(({ from, to, height, half }) =>
  half
    ? `M ${round(from)} ${round(FLOOR - height)} Q ${round((from + to) / 2)} ${round(FLOOR - height)} ${round(to)} ${FLOOR}`
    : `Q ${round((from + to) / 2)} ${round(FLOOR - 2 * height)} ${round(to)} ${FLOOR}`,
).join(" ");

function heightAt(x: number) {
  for (const { from, to, height, half } of ARCS_DATA) {
    if (x > to) continue;
    if (half) return height * (1 - ((x - from) / (to - from)) ** 2);
    const s = ((x - from) / (to - from)) * 2 - 1;
    return height * (1 - s * s);
  }
  return 0;
}

/* Strobe positions at equal time intervals. */
const STROBE = Array.from({ length: 30 }, (_, index) => {
  const x = START_X + ((END_X - START_X) * index) / 29;
  return { x: round(x), y: round(FLOOR - heightAt(x)), index };
});

/* SMIL timing: x moves linearly; y eases in on every fall and out on every
   rise, which is exactly the quadratic motion of a projectile. */
const EASE_IN = "0.333 0 0.667 0.333";
const EASE_OUT = "0.333 0.667 0.667 1";
const RUN = 0.82;
const DURATION = 4.2;

const yFrames: { y: number; t: number; spline: string }[] = [];
ARCS_DATA.forEach(({ from, to, height, half }) => {
  const at = (x: number) => (RUN * (x - START_X)) / (END_X - START_X);
  if (half) {
    yFrames.push({ y: FLOOR - height, t: 0, spline: EASE_IN });
  } else {
    yFrames.push({ y: FLOOR, t: at(from), spline: EASE_OUT });
    yFrames.push({
      y: FLOOR - height,
      t: at((from + to) / 2),
      spline: EASE_IN,
    });
  }
});
yFrames.push({ y: FLOOR, t: RUN, spline: "0 0 1 1" });
yFrames.push({ y: FLOOR, t: 1, spline: "" });

const Y_VALUES = yFrames.map((frame) => round(frame.y)).join(";");
const Y_TIMES = yFrames.map((frame) => round(frame.t * 1000) / 1000).join(";");
const Y_SPLINES = yFrames
  .slice(0, -1)
  .map((frame) => frame.spline)
  .join(";");

export function BounceTrail({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* On narrow screens the trail keeps a readable size and shows its
          middle stretch rather than shrinking to a hairline. */}
      <div className="flex w-full justify-center overflow-x-clip">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="block h-auto w-[max(100%,40rem)] max-w-none shrink-0 overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bounce-floor" x1="0" x2="1" y1="0" y2="0">
              <stop
                offset="0"
                style={{ stopColor: "var(--line-strong)", stopOpacity: 0 }}
              />
              <stop offset="0.15" style={{ stopColor: "var(--line-strong)" }} />
              <stop offset="0.85" style={{ stopColor: "var(--line-strong)" }} />
              <stop
                offset="1"
                style={{ stopColor: "var(--line-strong)", stopOpacity: 0 }}
              />
            </linearGradient>
            <linearGradient id="bounce-trail" x1="0" x2="1" y1="0" y2="0">
              <stop
                offset="0"
                style={{ stopColor: "var(--brand)", stopOpacity: 0.55 }}
              />
              <stop
                offset="1"
                style={{ stopColor: "var(--gold)", stopOpacity: 0.45 }}
              />
            </linearGradient>
          </defs>

          <line
            x1="0"
            x2={VIEW_WIDTH}
            y1={FLOOR + 11}
            y2={FLOOR + 11}
            stroke="url(#bounce-floor)"
            strokeWidth="1"
          />

          <path
            d={TRAIL_PATH}
            fill="none"
            stroke="url(#bounce-trail)"
            strokeWidth="1.25"
            strokeDasharray="2 6"
            strokeLinecap="round"
          />

          {STROBE.map(({ x, y, index }) => (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="var(--surface-2)"
              stroke="var(--brand)"
              strokeOpacity={0.18 + (0.32 * index) / 29}
              strokeWidth="1.25"
            />
          ))}

          {/* The moving ball is the gold planet from the logo. */}
          <g className="motion-reduce:hidden">
            <circle
              r="10"
              fill="var(--gold)"
              stroke="var(--surface-2)"
              strokeWidth="2"
              cx={START_X}
              cy={FLOOR - DROP}
            >
              <animate
                attributeName="cx"
                values={`${START_X};${round(END_X)};${round(END_X)}`}
                keyTimes={`0;${RUN};1`}
                dur={`${DURATION}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={Y_VALUES}
                keyTimes={Y_TIMES}
                calcMode="spline"
                keySplines={Y_SPLINES}
                dur={`${DURATION}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0;0"
                keyTimes={`0;0.04;${RUN - 0.04};${RUN + 0.04};1`}
                dur={`${DURATION}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
          <circle
            className="motion-safe:hidden"
            r="10"
            fill="var(--gold)"
            stroke="var(--surface-2)"
            strokeWidth="2"
            cx={START_X}
            cy={FLOOR - DROP}
          />
        </svg>
      </div>

      <a
        href={siteConfig.links.models}
        className="text-ink-muted hover:text-ink group mt-6 flex flex-col items-center gap-2 text-[0.75rem] transition-colors"
      >
        <span>向下浏览常见物理场景</span>
        <span className="border-line bg-surface-2 group-hover:border-brand/40 grid size-8 place-items-center rounded-full border shadow-sm transition-colors">
          <ChevronDownIcon className="size-4 motion-safe:animate-bounce" />
        </span>
      </a>
    </div>
  );
}
