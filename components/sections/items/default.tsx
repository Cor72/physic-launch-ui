import {
  CameraIcon,
  CircleUserRoundIcon,
  CoinsIcon,
  MoveUpRightIcon,
  PlayCircleIcon,
  SlidersHorizontalIcon,
  SplitIcon,
} from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import problemPreview from "@/public/2.png";

import {
  Container,
  Eyebrow,
  Section,
  SectionHeader,
  SectionLede,
  SectionTitle,
} from "../../ui/section";
import { CanvasPlayer } from "./canvas-player";

interface ItemProps {
  title: string;
  description: string;
  icon: ReactNode;
}

interface ItemsProps {
  title?: string;
  eyebrow?: string;
  figure?: string;
  description?: string;
  items?: ItemProps[] | false;
  className?: string;
}

/* Order matches the numbered pins on the workstation below. */
const DEFAULT_ITEMS: ItemProps[] = [
  {
    title: "题目图片输入",
    description: "上传清晰的物理题图片，开始识别题意与关键条件。",
    icon: <CameraIcon className="size-4" />,
  },
  {
    title: "题意与条件识别",
    description: "提取物体、已知量和运动阶段，生成前可以继续核对。",
    icon: <SplitIcon className="size-4" />,
  },
  {
    title: "动态画布生成",
    description: "将题目转化为可播放的物理场景，呈现关键运动过程。",
    icon: <PlayCircleIcon className="size-4" />,
  },
  {
    title: "运动过程观察",
    description: "播放、暂停与回看，对照题目观察受力、速度和轨迹。",
    icon: <MoveUpRightIcon className="size-4" />,
  },
  {
    title: "对象与参数调整",
    description: "在画布中调整对象和可用参数，继续验证自己的理解。",
    icon: <SlidersHorizontalIcon className="size-4" />,
  },
  {
    title: "积分与使用记录",
    description: "登录后查看积分余额和账户记录，清楚了解每次使用。",
    icon: <CircleUserRoundIcon className="size-4" />,
  },
];

function Pin({ n, className }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-gold ring-gold/25 grid size-5 shrink-0 place-items-center rounded-full font-mono text-[0.6875rem] font-semibold text-[oklch(22%_0.04_70)] shadow-sm ring-4",
        className,
      )}
    >
      {n}
    </span>
  );
}

/* Transcribed from /public/2.png. */
const CONDITIONS = [
  ["m", "2 kg"],
  ["v₀", "6 m/s"],
  ["θ", "53°"],
  ["h", "2 m"],
  ["μ", "0.25"],
  ["L", "8 m"],
];

/* Worked from those conditions: v_B = 10 m/s at 53° below horizontal, the
   arc radius is h / (1 − cos 53°) = 5 m, v_C² = 140, v_D = 10 m/s, and
   just reaching E needs v_D² = 5gR. */
const READOUTS = [
  ["A、B 高度差", "3.2 m"],
  ["C 点速度", "11.8 m/s"],
  ["C 点支持力", "76 N"],
];

const SLIDERS = [
  { label: "初速度 v₀", value: "6.0 m/s", fill: 0.42 },
  { label: "动摩擦因数 μ", value: "0.25", fill: 0.25 },
  { label: "圆轨道半径 R", value: "2.0 m", fill: 0.5 },
];

function Workstation() {
  return (
    <div className="reveal border-line rounded-[30px] border bg-[color-mix(in_oklab,var(--surface-3)_60%,transparent)] p-1.5 shadow-xl sm:p-2">
      <div className="border-line bg-surface-1 overflow-hidden rounded-[24px] border">
        {/* Title bar */}
        <div className="border-line-subtle flex h-12 items-center gap-3 border-b px-4">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[oklch(68%_0.17_25)]" />
            <span className="size-2.5 rounded-full bg-[oklch(80%_0.14_85)]" />
            <span className="size-2.5 rounded-full bg-[oklch(72%_0.15_150)]" />
          </span>
          <span className="text-ink-muted ml-2 truncate text-[0.8125rem]">
            第 1 题 · 滑块沿轨道运动
          </span>
          <span className="ml-auto flex items-center gap-2.5">
            <span className="border-line bg-surface-2 text-ink flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.75rem]">
              <CoinsIcon className="text-gold size-3.5" />
              <span className="numeral">1,280</span>
              <span className="text-ink-faint">示例积分</span>
            </span>
            <Pin n={6} />
          </span>
        </div>

        <div className="grid md:grid-cols-[1fr_240px] lg:grid-cols-[228px_1fr_252px]">
          {/* Source and recognised conditions */}
          <aside className="border-line-subtle hidden flex-col gap-5 border-r p-4 lg:flex">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="type-label text-ink-faint">题目原图</span>
                <Pin n={1} />
              </div>
              <div className="border-line overflow-hidden rounded-xl border bg-white">
                <Image
                  src={problemPreview}
                  alt=""
                  sizes="200px"
                  className="aspect-[4/3] h-auto w-full object-cover object-[50%_70%]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="type-label text-ink-faint">已知条件</span>
                <Pin n={2} />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CONDITIONS.map(([symbol, value]) => (
                  <span
                    key={symbol}
                    className="border-line bg-surface-2 flex items-baseline justify-between rounded-lg border px-2 py-1.5 font-mono text-[0.75rem]"
                  >
                    <span className="text-brand">{symbol}</span>
                    <span className="text-ink">{value}</span>
                  </span>
                ))}
              </div>
              <div className="text-ink-faint flex flex-wrap gap-1 text-[0.6875rem]">
                {["平抛", "圆弧", "摩擦", "圆轨道"].map((stage, index) => (
                  <span key={stage} className="flex items-center gap-1">
                    {index > 0 && <span aria-hidden="true">›</span>}
                    {stage}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* Canvas */}
          <div className="grid-dots relative min-w-0">
            <Pin n={3} className="absolute top-4 left-4 z-10" />
            <CanvasPlayer pin={<Pin n={4} />} />
          </div>

          {/* Parameters and readouts */}
          <aside className="border-line-subtle hidden flex-col gap-5 border-l p-4 md:flex">
            <div className="flex items-center justify-between">
              <span className="type-label text-ink-faint">参数</span>
              <Pin n={5} />
            </div>
            <div className="flex flex-col gap-4">
              {SLIDERS.map((slider) => (
                <div key={slider.label} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between text-[0.75rem]">
                    <span className="text-ink-muted">{slider.label}</span>
                    <span className="numeral text-ink font-mono">
                      {slider.value}
                    </span>
                  </div>
                  <span className="bg-line relative block h-1 rounded-full">
                    <span
                      className="from-brand to-brand/70 absolute inset-y-0 left-0 rounded-full bg-linear-to-r"
                      style={{ width: `${slider.fill * 100}%` }}
                    />
                    <span
                      className="border-brand bg-surface-1 absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm"
                      style={{ left: `${slider.fill * 100}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                ["受力", true],
                ["速度", true],
                ["轨迹", true],
                ["能量", false],
              ].map(([label, on]) => (
                <span
                  key={String(label)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[0.6875rem]",
                    on
                      ? "border-brand/35 bg-brand-muted text-brand"
                      : "border-line text-ink-faint",
                  )}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="border-line-subtle mt-auto flex flex-col gap-2 border-t pt-4">
              <span className="type-label text-ink-faint">读数</span>
              {READOUTS.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between text-[0.75rem]"
                >
                  <span className="text-ink-muted">{label}</span>
                  <span className="numeral text-ink font-mono">{value}</span>
                </div>
              ))}
              <div className="border-gold/30 bg-gold-muted mt-1 flex items-baseline justify-between rounded-lg border px-2.5 py-2 text-[0.75rem]">
                <span className="text-ink">恰好到达 E 点</span>
                <span className="numeral text-gold font-mono font-semibold">
                  R = 2 m
                </span>
              </div>
            </div>
          </aside>
        </div>
        <details className="border-line-subtle border-t lg:hidden">
          <summary className="text-ink-muted hover:text-brand min-h-12 cursor-pointer px-4 py-3 text-[0.8125rem] transition-colors">
            查看题目条件与示例参数
          </summary>
          <div className="grid gap-5 px-4 pt-1 pb-5 sm:grid-cols-2">
            <div>
              <p className="type-label text-ink-faint mb-3">已知条件</p>
              <dl className="grid grid-cols-2 gap-2">
                {CONDITIONS.map(([symbol, value]) => (
                  <div
                    key={symbol}
                    className="border-line bg-surface-2 flex items-baseline justify-between gap-2 rounded-lg border px-3 py-2 font-mono text-xs"
                  >
                    <dt className="text-brand">{symbol}</dt>
                    <dd className="text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="md:hidden">
              <p className="type-label text-ink-faint mb-3">示例参数</p>
              <dl className="grid gap-2">
                {SLIDERS.map((slider) => (
                  <div
                    key={slider.label}
                    className="flex justify-between gap-3 text-xs"
                  >
                    <dt className="text-ink-muted">{slider.label}</dt>
                    <dd className="numeral text-ink font-mono">
                      {slider.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </details>
        <div className="border-line-subtle flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
          <p className="text-ink-faint text-xs">
            界面与参数为示例，进入画布可上传题目并调整。
          </p>
          <a
            href={siteConfig.canvasUrl}
            className="text-brand inline-flex min-h-11 items-center gap-2 text-[0.8125rem] font-medium"
          >
            进入画布体验{" "}
            <MoveUpRightIcon aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Items({
  title = "从题目图片，到可操作的动态画布",
  eyebrow = "核心功能",
  figure = "03",
  description = "星驰视界把题目识别、动态生成和交互观察放在同一条学习路径中。生成内容仅作学习辅助，请始终以原题条件和独立判断为准。",
  items = DEFAULT_ITEMS,
  className,
}: ItemsProps) {
  return (
    <Section id="features" className={className}>
      <Container className="flex flex-col gap-14 sm:gap-16">
        <div className="grid items-end gap-6 lg:grid-cols-[1.15fr_1fr]">
          <SectionHeader>
            <Eyebrow index={figure}>{eyebrow}</Eyebrow>
            <SectionTitle>{title}</SectionTitle>
          </SectionHeader>
          <SectionLede className="lg:justify-self-end lg:text-right">
            {description}
          </SectionLede>
        </div>

        <Workstation />

        {items !== false && items.length > 0 && (
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <div key={item.title} className="reveal flex gap-4">
                <Pin n={index + 1} className="mt-0.5" />
                <div className="border-line flex flex-1 flex-col gap-2 border-t pt-4">
                  <h3 className="type-h3 text-ink flex items-center gap-2">
                    <span className="text-ink-faint">{item.icon}</span>
                    {item.title}
                  </h3>
                  <p className="type-copy-sm text-ink-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
