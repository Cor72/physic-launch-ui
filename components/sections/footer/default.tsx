import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import LaunchUI from "../../logos/launch-ui";
import {
  Footer,
  FooterBottom,
  FooterColumn,
  FooterContent,
} from "../../ui/footer";
import { ModeToggle } from "../../ui/mode-toggle";

interface FooterLink {
  text: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: ReactNode;
  name?: string;
  columns?: FooterColumnProps[];
  copyright?: string;
  policies?: FooterLink[];
  showModeToggle?: boolean;
  className?: string;
}

export default function FooterSection({
  logo = <LaunchUI />,
  name = siteConfig.name,
  columns = [
    {
      title: "探索平台",
      links: [
        { text: "动态演示", href: siteConfig.getStartedUrl },
        { text: "核心功能", href: siteConfig.links.features },
        { text: "题型模型", href: siteConfig.links.models },
      ],
    },
    {
      title: "学习与教学",
      links: [
        { text: "学生自主学习", href: siteConfig.links.features },
        { text: "教师课堂讲授", href: siteConfig.links.teachers },
        { text: "会员方案", href: siteConfig.links.pricing },
      ],
    },
    {
      title: "了解更多",
      links: [
        { text: "项目介绍", href: siteConfig.homeUrl },
        { text: "常见问题", href: siteConfig.links.faq },
        { text: "功能规划", href: siteConfig.links.features },
      ],
    },
  ],
  copyright = "© 2026 悟言视界 · 让物理过程看得见",
  policies = [
    { text: "数据与隐私说明", href: siteConfig.links.faq },
    { text: "使用说明", href: siteConfig.links.faq },
  ],
  showModeToggle = true,
  className,
}: FooterProps) {
  return (
    <footer className={cn("bg-background w-full px-4", className)}>
      <div className="max-w-container mx-auto">
        <Footer>
          <FooterContent>
            <FooterColumn className="col-span-2 sm:col-span-3 md:col-span-1">
              <div className="flex items-center gap-2">
                {logo}
                <h3 className="text-xl font-bold">{name}</h3>
              </div>
              <p className="text-muted-foreground max-w-[240px] text-sm leading-relaxed">
                把抽象的物理题，变成看得见、能探索的动态过程。
              </p>
            </FooterColumn>
            {columns.map((column) => (
              <FooterColumn key={column.title}>
                <h3 className="text-md pt-1 font-semibold">{column.title}</h3>
                {column.links.map((link) => (
                  <a
                    key={`${link.href}-${link.text}`}
                    href={link.href}
                    className="text-muted-foreground text-sm"
                  >
                    {link.text}
                  </a>
                ))}
              </FooterColumn>
            ))}
          </FooterContent>
          <FooterBottom>
            <div>{copyright}</div>
            <div className="flex flex-wrap items-center gap-4">
              {policies.map((policy) => (
                <a key={`${policy.href}-${policy.text}`} href={policy.href}>
                  {policy.text}
                </a>
              ))}
              {showModeToggle && <ModeToggle />}
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}
