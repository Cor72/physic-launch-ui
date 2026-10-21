import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import LaunchUI from "../../logos/launch-ui";
import { Container } from "../../ui/section";

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
  className?: string;
}

const linkClassName =
  "text-ink-muted hover:text-ink w-fit text-[0.875rem] transition-colors";

export default function FooterSection({
  logo = <LaunchUI />,
  name = siteConfig.name,
  columns = [
    {
      title: "探索平台",
      links: [
        { text: "适用场景", href: siteConfig.links.models },
        { text: "使用流程", href: siteConfig.links.workflow },
        { text: "核心功能", href: siteConfig.links.features },
      ],
    },
    {
      title: "账户与购买",
      links: [
        { text: "登录", href: siteConfig.loginUrl },
        { text: "注册", href: siteConfig.registerUrl },
        { text: "积分套餐", href: siteConfig.links.pricing },
        { text: "常见问题", href: siteConfig.links.faq },
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
  className,
}: FooterProps) {
  return (
    <footer
      className={cn("relative w-full overflow-hidden px-5 sm:px-8", className)}
    >
      <Container>
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 pt-20 pb-14 sm:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-16 lg:pt-24">
          <div className="col-span-2 flex flex-col gap-5 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              {logo}
              <span className="text-ink text-[0.9375rem] font-semibold tracking-[-0.014em]">
                {name}
              </span>
            </div>
            <p className="type-copy-sm text-ink-muted max-w-[19rem]">
              把抽象的物理题，变成看得见、能探索的动态过程。
            </p>

            {/* Filing details, set as a labelled record. */}
            <dl className="mt-1 flex flex-col gap-2 text-[0.8125rem]">
              <div className="flex gap-3">
                <dt className="text-ink-faint w-14 shrink-0">运营主体</dt>
                <dd className="text-ink-muted">{siteConfig.operator}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-ink-faint w-14 shrink-0">客服邮箱</dt>
                <dd>
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="text-ink-muted hover:text-ink transition-colors"
                  >
                    {siteConfig.supportEmail}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-ink-faint w-14 shrink-0">客服电话</dt>
                <dd>
                  <a
                    href={`tel:${siteConfig.supportPhone}`}
                    className="numeral text-ink-muted hover:text-ink transition-colors"
                  >
                    {siteConfig.supportPhone}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3.5">
              <h3 className="type-label text-ink-faint mb-1">{column.title}</h3>
              {column.links.map((link) => (
                <a
                  key={`${link.href}-${link.text}`}
                  href={link.href}
                  className={linkClassName}
                >
                  {link.text}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="border-line-subtle text-ink-faint flex flex-col gap-4 border-t py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>{copyright}</span>
            <a
              href={siteConfig.icpUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink transition-colors"
            >
              {siteConfig.icpNumber}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {policies.map((policy) => (
              <a
                key={`${policy.href}-${policy.text}`}
                href={policy.href}
                className="hover:text-ink transition-colors"
              >
                {policy.text}
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* The Latin wordmark from the logo lockup, set large and faded out
          below the fold line. */}
      <div
        aria-hidden="true"
        className="from-ink/[0.11] pointer-events-none -mb-[0.2em] bg-linear-to-b to-transparent to-80% bg-clip-text text-center text-[clamp(3.5rem,20vw,17rem)] leading-[0.9] font-light tracking-[-0.05em] text-transparent select-none"
      >
        stellarvista
      </div>
    </footer>
  );
}
