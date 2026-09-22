import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import Glow from "../../ui/glow";
import { LinkButton, type LinkButtonProps } from "../../ui/link-button";
import { Section } from "../../ui/section";

interface CTAButtonProps extends Omit<LinkButtonProps, "children"> {
  text: string;
}

interface CTAProps {
  title?: string;
  buttons?: CTAButtonProps[] | false;
  className?: string;
}

const DEFAULT_CTA_BUTTONS: CTAButtonProps[] = [
  {
    href: siteConfig.registerUrl,
    text: "注册并进入画布",
    variant: "white",
  },
];

export default function CTA({
  title = "让每一次讲解，都有看得见的物理过程",
  buttons = DEFAULT_CTA_BUTTONS,
  className,
}: CTAProps) {
  return (
    <Section
      id="teachers"
      className={cn("group relative overflow-hidden", className)}
    >
      <div className="max-w-container relative z-10 mx-auto flex flex-col items-center gap-6 text-center sm:gap-8">
        <h2 className="max-w-[640px] text-3xl leading-tight font-semibold text-balance sm:text-5xl sm:leading-tight">
          {title}
        </h2>
        <p className="text-muted-foreground max-w-[640px] text-base leading-relaxed sm:text-lg">
          为学生建立清晰的物理图景，也为教师准备更直观的课堂演示。先从这道圆轨道题开始，观察一个完整的运动过程。
        </p>
        {buttons !== false && buttons.length > 0 && (
          <div className="flex justify-center gap-4">
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
      <div className="absolute top-0 left-0 h-full w-full translate-y-[1rem] opacity-80 transition-all duration-500 ease-in-out group-hover:translate-y-[-2rem] group-hover:opacity-100">
        <Glow variant="bottom" />
      </div>
    </Section>
  );
}
