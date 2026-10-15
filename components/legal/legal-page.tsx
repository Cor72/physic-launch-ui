import Link from "next/link";
import { ReactNode } from "react";

import LaunchUI from "@/components/logos/launch-ui";
import { siteConfig } from "@/config/site";

interface LegalPageProps {
  title: string;
  summary: string;
  children: ReactNode;
}

export function LegalPage({ title, summary, children }: LegalPageProps) {
  return (
    <main className="bg-background text-foreground min-h-[100dvh]">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-[28rem] bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--brand)_11%,transparent),transparent_68%)]" />
      <header className="border-border/70 bg-background/85 sticky top-0 z-20 border-b px-4 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <LaunchUI />
            <span>{siteConfig.name}</span>
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            返回首页
          </Link>
        </div>
      </header>

      <article className="relative z-10 mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="border-border bg-card/85 rounded-3xl border p-6 shadow-xl shadow-orange-950/5 sm:p-10">
          <header className="border-border mb-10 border-b pb-8">
            <p className="text-brand mb-3 text-sm font-semibold">星驰视界规则文件</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-5 leading-relaxed">{summary}</p>
            <p className="text-muted-foreground mt-4 text-sm">
              生效日期：2026年10月14日
            </p>
          </header>

          <div className="legal-copy space-y-9">{children}</div>
        </div>

        <nav className="text-muted-foreground mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
          <Link className="hover:text-foreground" href={siteConfig.links.terms}>
            用户协议
          </Link>
          <Link className="hover:text-foreground" href={siteConfig.links.privacy}>
            隐私政策
          </Link>
          <Link className="hover:text-foreground" href={siteConfig.links.pointsPolicy}>
            积分购买及退款规则
          </Link>
        </nav>
      </article>

      <footer className="border-border border-t px-4 py-8">
        <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col gap-3 text-center text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:text-left">
          <span>运营主体：{siteConfig.operator}</span>
          <a href={`mailto:${siteConfig.supportEmail}`}>客服邮箱：{siteConfig.supportEmail}</a>
          <a href={`tel:${siteConfig.supportPhone}`}>客服电话：{siteConfig.supportPhone}</a>
          <a href={siteConfig.icpUrl} target="_blank" rel="noreferrer">
            {siteConfig.icpNumber}
          </a>
        </div>
      </footer>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground space-y-3 text-sm leading-7 sm:text-base sm:leading-8">
        {children}
      </div>
    </section>
  );
}
