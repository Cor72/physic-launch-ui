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
        { text: "实际演示", href: siteConfig.getStartedUrl },
        { text: "核心功能", href: siteConfig.links.features },
        { text: "使用流程", href: siteConfig.links.workflow },
      ],
    },
    {
      title: "账户与购买",
      links: [
        { text: "登录", href: siteConfig.loginUrl },
        { text: "注册", href: siteConfig.registerUrl },
        { text: "积分套餐", href: siteConfig.links.pricing },
      ],
    },
    {
      title: "规则与政策",
      links: [
        { text: "用户协议", href: siteConfig.links.terms },
        { text: "隐私政策", href: siteConfig.links.privacy },
        { text: "积分购买及退款规则", href: siteConfig.links.pointsPolicy },
      ],
    },
  ],
  copyright = `© 2026 ${siteConfig.name}`,
  policies = [
    { text: "用户协议", href: siteConfig.links.terms },
    { text: "隐私政策", href: siteConfig.links.privacy },
    { text: "积分与退款", href: siteConfig.links.pointsPolicy },
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
              <div className="text-muted-foreground flex max-w-[300px] flex-col gap-2 text-xs leading-relaxed">
                <span>运营主体：{siteConfig.operator}</span>
                <a href={`mailto:${siteConfig.supportEmail}`}>
                  客服邮箱：{siteConfig.supportEmail}
                </a>
                <a href={`tel:${siteConfig.supportPhone}`}>
                  客服电话：{siteConfig.supportPhone}
                </a>
              </div>
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
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
              <span>{copyright}</span>
              <a
                href={siteConfig.icpUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                {siteConfig.icpNumber}
              </a>
            </div>
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
