import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import { InViewMotion } from "../../ui/in-view-motion";
import { LinkButton, type LinkButtonProps } from "../../ui/link-button";
import { Orbits } from "../../ui/orbits";
import { Container } from "../../ui/section";
import { Starfield } from "../../ui/starfield";
import { BounceTrail } from "./bounce-trail";

interface HeroButtonProps extends Omit<LinkButtonProps, "children"> {
  text: string;
}

interface HeroProps {
  eyebrow?: string;
  titleLines?: ReactNode[];
  description?: string;
  meta?: string[] | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

const DEFAULT_HERO_BUTTONS: HeroButtonProps[] = [
  {
    href: siteConfig.canvasUrl,
    text: "免费体验画布",
    variant: "ink",
    iconRight: <ArrowRightIcon className="size-4" />,
  },
  {
    href: siteConfig.links.pricing,
    text: "查看积分套餐",
    variant: "secondary",
  },
];

const DEFAULT_HERO_BADGE = (
  <span className="border-line inline-flex items-center gap-2 rounded-full border bg-[color-mix(in_oklab,var(--surface-2)_50%,transparent)] py-1 pr-3 pl-2 text-[0.8125rem] backdrop-blur-md">
    <span aria-hidden="true" className="relative flex size-2">
      <span className="bg-brand absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping" />
      <span className="bg-brand relative inline-flex size-2 rounded-full" />
    </span>
    <span className="text-ink shrink-0 whitespace-nowrap">在线可用</span>
    <span aria-hidden="true" className="bg-line-strong h-3 w-px" />
    <span className="text-ink-muted hidden sm:inline">
      中学物理 · AI 动态题目可视化
    </span>
    <span className="text-ink-muted whitespace-nowrap sm:hidden">
      AI 物理可视化
    </span>
  </span>
);

const DEFAULT_HERO_META = [
  "无需绑定支付方式",
  "积分长期有效",
  "一次性购买，不自动续费",
];

const DEFAULT_TITLE_LINES: ReactNode[] = [
  "让物理题",
  <>
    变成<span className="text-gradient">可观察的动态过程</span>
  </>,
];

export default function Hero({
  eyebrow,
  titleLines = DEFAULT_TITLE_LINES,
  description = "上传物理题目图片，识别题意并生成可交互的动态画布，直观看见运动、受力与轨迹。",
  meta = DEFAULT_HERO_META,
  badge = DEFAULT_HERO_BADGE,
  buttons = DEFAULT_HERO_BUTTONS,
  className,
}: HeroProps) {
  return (
    /* White introductory panel. */
    <div
      data-surface="light"
      className="bg-surface-1 text-ink border-line relative isolate mx-2 mt-2 overflow-hidden rounded-[28px] border sm:mx-3 sm:mt-3"
    >
      <section
        className={cn(
          "relative isolate overflow-hidden px-5 pt-32 pb-16 sm:px-8 sm:pt-40 sm:pb-20",
          className,
        )}
      >
        <InViewMotion
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_70%_0%,var(--glow-1),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_8%_30%,var(--glow-2),transparent_70%)]" />
          <Starfield
            seed={7}
            className="absolute inset-0 size-full opacity-25"
          />
          <Orbits
            id="hero-orbits"
            className="fade-core absolute -top-[6%] left-[22%] h-[80%] w-[110%] opacity-40 max-md:hidden"
          />
          <div className="grid-field fade-radial absolute inset-0 opacity-60" />
        </InViewMotion>

        <Container>
          <div className="flex max-w-4xl flex-col items-start gap-7">
            <div className="motion-safe:animate-appear flex flex-wrap items-center gap-3">
              {badge !== false && badge}
              {eyebrow && (
                <span className="type-label text-ink-muted">{eyebrow}</span>
              )}
            </div>

            <h1 className="type-display text-ink motion-safe:animate-appear max-[359px]:text-[1.625rem]">
              {titleLines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <p className="type-lede text-ink-muted motion-safe:animate-appear max-w-[34rem] text-balance motion-safe:opacity-0 motion-safe:delay-100">
              {description}
            </p>

            {buttons !== false && buttons.length > 0 && (
              <div className="motion-safe:animate-appear flex flex-wrap gap-3 motion-safe:opacity-0 motion-safe:delay-200">
                {buttons.map((button) => (
                  <LinkButton
                    key={`${button.href}-${button.text}`}
                    variant={button.variant || "default"}
                    size="xl"
                    href={button.href}
                    icon={button.icon}
                    iconRight={button.iconRight}
                  >
                    {button.text}
                  </LinkButton>
                ))}
              </div>
            )}

            {meta !== false && meta.length > 0 && (
              <ul className="motion-safe:animate-appear text-ink-muted flex flex-wrap items-center gap-x-6 gap-y-2 motion-safe:opacity-0 motion-safe:delay-300">
                {meta.map((entry) => (
                  <li
                    key={entry}
                    className="flex items-center gap-2 text-[0.8125rem]"
                  >
                    <CheckIcon
                      aria-hidden="true"
                      className="text-gold size-3.5"
                    />
                    {entry}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <BounceTrail className="motion-safe:animate-appear mt-10 motion-safe:opacity-0 motion-safe:delay-500 sm:mt-6" />
        </Container>
      </section>
    </div>
  );
}
