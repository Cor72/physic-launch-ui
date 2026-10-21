import {
  ImageUpIcon,
  PauseIcon,
  ScanSearchIcon,
  WandSparklesIcon,
} from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

import problemPreview from "@/public/2.png";

import { CircularScene } from "../../physics/circular";
import { InViewMotion } from "../../ui/in-view-motion";
import {
  Band,
  Container,
  Eyebrow,
  SectionHeader,
  SectionLede,
  SectionTitle,
} from "../../ui/section";
import { Starfield } from "../../ui/starfield";

interface StatItemProps {
  title: string;
  description: string;
  icon: ReactNode;
  visual: ReactNode;
}

interface StatsProps {
  title?: string;
  eyebrow?: string;
  figure?: string;
  description?: string;
  items?: StatItemProps[] | false;
  className?: string;
}

function UploadVisual() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="border-line relative w-[62%] -rotate-3 overflow-hidden rounded-xl border bg-white shadow-lg">
        <Image
          src={problemPreview}
          alt=""
          sizes="220px"
          className="aspect-[4/3] h-auto w-full object-cover object-[50%_70%]"
        />
        <span className="from-brand/0 via-brand/30 to-brand/0 motion-safe:animate-scan absolute inset-x-0 top-0 h-[14%] bg-linear-to-b motion-reduce:hidden" />
      </div>
      <span className="border-line bg-surface-2 text-ink absolute right-[14%] bottom-[12%] flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.75rem] shadow-md">
        <ImageUpIcon className="text-brand size-3.5" />第 1 题.jpg
      </span>
    </div>
  );
}

const CHECKED = [
  ["研究对象", "小滑块 · m = 2 kg"],
  ["初速度", "v₀ = 6 m/s"],
  ["圆心角", "θ = 53°"],
  ["动摩擦因数", "μ = 0.25"],
];

function RecognizeVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-6">
      {CHECKED.map(([label, value]) => (
        <div
          key={label}
          className="border-line bg-surface-2/80 flex items-center gap-3 rounded-lg border px-3 py-2 text-[0.8125rem]"
        >
          <span className="bg-brand/15 text-brand grid size-5 place-items-center rounded-full text-[0.6875rem]">
            ✓
          </span>
          <span className="text-ink-muted">{label}</span>
          <span className="text-ink ml-auto font-mono text-[0.75rem]">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ObserveVisual() {
  return (
    <div className="flex h-full flex-col">
      <div className="grid-dots relative flex-1">
        <CircularScene className="absolute inset-0 size-full p-3" />
      </div>
      <div className="border-line-subtle flex items-center gap-3 border-t px-4 py-2.5">
        <span className="bg-ink text-surface-1 grid size-6 place-items-center rounded-full">
          <PauseIcon className="size-3" />
        </span>
        <span className="bg-line relative h-1 flex-1 overflow-hidden rounded-full">
          <span className="bg-brand absolute inset-y-0 left-0 w-[62%] rounded-full" />
        </span>
        <span className="text-ink-faint font-mono text-[0.6875rem]">0.5×</span>
      </div>
    </div>
  );
}

const DEFAULT_STATS: StatItemProps[] = [
  {
    title: "上传题目",
    description: "选择清晰、完整且不含无关个人信息的物理题图片。",
    icon: <ImageUpIcon className="size-4" />,
    visual: <UploadVisual />,
  },
  {
    title: "核对识别结果",
    description: "检查题意、物体和已知条件，避免模糊图片影响生成。",
    icon: <ScanSearchIcon className="size-4" />,
    visual: <RecognizeVisual />,
  },
  {
    title: "观察动态过程",
    description: "进入生成的画布，通过播放、暂停和调整继续探索。",
    icon: <WandSparklesIcon className="size-4" />,
    visual: <ObserveVisual />,
  },
];

export default function Stats({
  title = "三个动作，看见题目里的运动",
  eyebrow = "使用流程",
  figure = "02",
  description = "从一张题目照片开始，几分钟内就能在画布上播放、暂停和回看整个物理过程。",
  items = DEFAULT_STATS,
  className,
}: StatsProps) {
  return (
    <Band id="workflow" className={className}>
      <InViewMotion
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--glow-1),transparent_70%)]" />
        <Starfield
          seed={23}
          count={70}
          sparkles={3}
          className="absolute inset-0 size-full opacity-20"
        />
        <div className="grid-field fade-radial absolute inset-0" />
      </InViewMotion>

      <div className="px-5 py-24 sm:px-8 sm:py-32">
        <Container className="flex flex-col gap-16">
          <SectionHeader align="center">
            <Eyebrow index={figure} className="justify-center">
              {eyebrow}
            </Eyebrow>
            <SectionTitle className="max-w-2xl">{title}</SectionTitle>
            <SectionLede className="text-balance">{description}</SectionLede>
          </SectionHeader>

          {items !== false && items.length > 0 && (
            <InViewMotion className="flex flex-col gap-6">
              {/* Stepper above the cards. The connector runs between node
                  centres only, so it never shows through the glass. */}
              <div aria-hidden="true" className="relative hidden md:block">
                <div className="hairline-live absolute top-1/2 right-[16.66%] left-[16.66%] h-px">
                  <span className="bg-line-strong absolute inset-0" />
                  <span className="hairline-live-beam motion-safe:animate-sweep absolute inset-y-0 w-1/3 motion-reduce:hidden" />
                </div>
                <div className="relative grid grid-cols-3 gap-5">
                  {items.map((item, index) => (
                    <div key={item.title} className="flex justify-center">
                      <span className="border-gold/40 bg-surface-1 text-gold grid size-10 place-items-center rounded-full border font-mono text-sm shadow-[0_0_0_6px_var(--surface-1)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {items.map((item, index) => (
                  <div
                    key={item.title}
                    className="reveal glass relative flex flex-col overflow-hidden rounded-3xl"
                  >
                    <div className="border-line-subtle h-[236px] border-b">
                      {item.visual}
                    </div>
                    <div className="flex flex-col gap-3 p-6">
                      <div className="flex items-center gap-3">
                        <span className="border-gold/40 text-gold grid size-7 place-items-center rounded-full border font-mono text-[0.75rem] md:hidden">
                          {index + 1}
                        </span>
                        <h3 className="type-h3 text-ink">{item.title}</h3>
                        <span className="text-ink-faint ml-auto">
                          {item.icon}
                        </span>
                      </div>
                      <p className="type-copy-sm text-ink-muted">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </InViewMotion>
          )}
        </Container>
      </div>
    </Band>
  );
}
