import { ArrowRightIcon } from "lucide-react";

import { siteConfig } from "@/config/site";

import LaunchUI from "../../logos/launch-ui";
import { InViewMotion } from "../../ui/in-view-motion";
import { LinkButton, type LinkButtonProps } from "../../ui/link-button";
import { Orbits } from "../../ui/orbits";
import { Band, Container } from "../../ui/section";
import { Starfield } from "../../ui/starfield";

interface CTAButtonProps extends Omit<LinkButtonProps, "children"> {
  text: string;
}

interface CTAProps {
  titleLines?: string[];
  description?: string;
  note?: string;
  buttons?: CTAButtonProps[] | false;
  className?: string;
}

const DEFAULT_CTA_BUTTONS: CTAButtonProps[] = [
  {
    href: siteConfig.registerUrl,
    text: "注册并免费体验",
    variant: "ink",
    iconRight: <ArrowRightIcon className="size-4" />,
  },
  {
    href: siteConfig.canvasUrl,
    text: "以游客身份进入画布",
    variant: "secondary",
  },
];

export default function CTA({
  titleLines = ["从一道题开始，", "看见物理如何发生"],
  description = "注册账户后可以进入画布。购买积分前，请先了解积分用途、扣除方式和退款规则。",
  note = "See physics in motion",
  buttons = DEFAULT_CTA_BUTTONS,
  className,
}: CTAProps) {
  return (
    <Band id="start" className={className}>
      <InViewMotion
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_42%,var(--glow-1),transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_50%_30%,var(--glow-2),transparent_70%)]" />
        <Starfield
          seed={53}
          count={90}
          sparkles={5}
          className="absolute inset-0 size-full opacity-20"
        />
        <Orbits
          id="cta-orbits"
          tilt={-8}
          className="fade-core absolute inset-0 size-full opacity-20"
        />
        <div className="grid-field fade-radial absolute inset-0 opacity-50" />
      </InViewMotion>

      <div className="px-5 py-28 sm:px-8 sm:py-36">
        <Container className="flex flex-col items-center gap-7 text-center">
          {/* The brand mark at the centre of the orbits it is drawn from. */}
          <div className="relative grid place-items-center">
            <span
              aria-hidden="true"
              className="absolute size-40 rounded-full bg-[radial-gradient(circle,oklch(100%_0_0/0.16),transparent_65%)] blur-md"
            />
            <LaunchUI className="motion-safe:animate-float relative size-24" />
          </div>

          <h2 className="type-display text-ink">
            {titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <p className="type-lede text-ink-muted max-w-[34rem] text-balance">
            {description}
          </p>

          {buttons !== false && buttons.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-3">
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

          {note && <p className="type-label text-gold mt-4">{note}</p>}
        </Container>
      </div>
    </Band>
  );
}
