import { ArrowRightIcon, BookOpenIcon } from "lucide-react";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import taskPreview from "@/public/1.png";
import problemPreview from "@/public/2.png";

import { Badge } from "../../ui/badge";
import Glow from "../../ui/glow";
import { LinkButton, type LinkButtonProps } from "../../ui/link-button";
import { Mockup, MockupFrame } from "../../ui/mockup";
import Screenshot from "../../ui/screenshot";
import { Section } from "../../ui/section";
import styles from "./hero.module.css";
import HeroBall from "./hero-ball";
import PreviewVideo from "./preview-video";

interface HeroButtonProps extends Omit<LinkButtonProps, "children"> {
  text: string;
}

interface HeroProps {
  title1?: string;
  title2?: string;
  description1?: string;
  description2?: string;
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

const DEFAULT_HERO_BUTTONS: HeroButtonProps[] = [
  {
    href: siteConfig.canvasUrl,
    text: "免费体验画布",
    variant: "white",
  },
  {
    href: siteConfig.links.pricing,
    text: "查看积分套餐",
    variant: "glow",
    icon: <BookOpenIcon className="mr-2 size-4" />,
  },
];

const DEFAULT_HERO_BADGE = (
  <Badge variant="outline" className="motion-safe:animate-appear flex-wrap">
    <span className="text-muted-foreground">在线可用</span>
    <a href={siteConfig.getStartedUrl} className="flex items-center gap-1">
      查看实际演示
      <ArrowRightIcon className="size-3" />
    </a>
  </Badge>
);

const HERO_PREVIEWS = [
  {
    name: "tasks",
    type: "image",
    srcLight: taskPreview,
    alt: "星驰视界题目识别页面预览",
  },
  {
    name: "problem",
    type: "image",
    srcLight: problemPreview,
    alt: "滑块沿圆轨道运动的物理题目预览",
  },
  {
    name: "simulation",
    type: "video",
  },
] as const;

function HeroShowcase() {
  return (
    <div className={styles.showcase}>
      {HERO_PREVIEWS.map((preview) => (
        <div key={preview.name} className={styles.preview}>
          <MockupFrame
            data-hero-preview={preview.name}
            className={styles.previewFrame}
            size="small"
          >
            {["tl", "tr", "br", "bl"].map((corner) => (
              <span
                key={corner}
                data-hero-corner={corner}
                className={styles.edgeProbe}
                aria-hidden="true"
              />
            ))}
            <Mockup
              type="responsive"
              className="bg-background w-full rounded-xl border-0"
            >
              {preview.type === "video" ? (
                <PreviewVideo />
              ) : (
                <Screenshot
                  srcLight={preview.srcLight}
                  alt={preview.alt}
                  width={preview.srcLight.width}
                  height={preview.srcLight.height}
                  loading="eager"
                  sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1312px) calc(100vw - 224px), 1088px"
                  className="h-auto w-full"
                />
              )}
            </Mockup>
          </MockupFrame>
        </div>
      ))}
    </div>
  );
}

export default function Hero({
  title1 = "星驰视界",
  title2 = "让物理题变成可观察的动态过程",
  description1 = "上传物理题目图片，识别题意并生成可交互的动态画布，直观看见运动、受力与轨迹。",
  mockup,
  badge = DEFAULT_HERO_BADGE,
  buttons = DEFAULT_HERO_BUTTONS,
  className,
}: HeroProps) {
  return (
    <div data-hero-physics-root="" className="relative">
      <Section
        className={cn(
          "relative isolate overflow-hidden pt-8 pb-0 sm:pt-12 sm:pb-0 md:pt-12 md:pb-0",
          className,
        )}
      >
        <div className="max-w-container mx-auto">
          <div className="relative z-20 flex max-w-3xl flex-col items-start gap-6 text-left sm:gap-8">
            {badge !== false && badge}
            <h1 className="text-foreground motion-safe:animate-appear text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl sm:leading-tight lg:text-7xl lg:leading-tight">
              {title1}
            </h1>
            <h1 className="text-foreground motion-safe:animate-appear text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-tight">
              {title2}
            </h1>
            <p className="text-muted-foreground motion-safe:animate-appear max-w-[740px] text-base leading-relaxed font-medium motion-safe:opacity-0 motion-safe:delay-100 sm:text-xl sm:leading-relaxed">
              {description1}
            </p>
            {buttons !== false && buttons.length > 0 && (
              <div className="motion-safe:animate-appear flex flex-wrap justify-start gap-4 motion-safe:opacity-0 motion-safe:delay-300">
                {buttons.map((button) => (
                  <LinkButton
                    key={`${button.href}-${button.text}`}
                    variant={button.variant || "default"}
                    size="lg"
                    href={button.href}
                    icon={button.icon}
                    iconRight={button.iconRight}
                  >
                    {button.text}
                  </LinkButton>
                ))}
              </div>
            )}
          </div>
          {mockup !== false && (
            <div id="demo" className={cn(styles.visual, "scroll-mt-32")}>
              <div
                aria-hidden="true"
                className={cn(styles.glow, "dark:hidden")}
              />
              <Glow
                aria-hidden="true"
                variant="top"
                className="pointer-events-none -z-10 hidden opacity-60 dark:block"
              />
              {mockup === undefined ? (
                <HeroShowcase />
              ) : (
                <MockupFrame className="relative my-12" size="small">
                  <Mockup
                    type="responsive"
                    className="bg-background/90 w-full rounded-xl border-0"
                  >
                    {mockup}
                  </Mockup>
                </MockupFrame>
              )}
            </div>
          )}
        </div>
      </Section>
      {mockup === undefined && <HeroBall />}
    </div>
  );
}
