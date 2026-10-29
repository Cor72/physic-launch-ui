import Link from "next/link";
import { ReactNode } from "react";

import LaunchUI from "@/components/logos/launch-ui";
import { siteConfig } from "@/config/site";

interface LegalPageProps {
  title: string;
  summary: string;
  effectiveDate?: string;
  children: ReactNode;
}

export function LegalPage({
  title,
  summary,
  effectiveDate = "2026-10-14",
  children,
}: LegalPageProps) {
  return (
    <main className="bg-background text-foreground min-h-[100dvh]">
      {/* Same calibrated field as the marketing pages, so a policy page
          still reads as part of the product rather than a bare document
          dump. The stock version used a hard radial wash of brand at 11%,
          which banded visibly across the header. */}
      <div
        aria-hidden="true"
        className="grid-field fade-top pointer-events-none fixed inset-x-0 top-0 -z-10 h-[32rem]"
      />

      <header className="border-line-subtle bg-surface-1/75 supports-[backdrop-filter]:bg-surface-1/60 sticky top-0 z-20 border-b px-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex h-16 max-w-measure items-center justify-between">
          <Link
            href="/"
            className="text-ink flex items-center gap-2.5 text-[0.9375rem] font-semibold tracking-[-0.014em]"
          >
            <LaunchUI />
            <span>{siteConfig.name}</span>
          </Link>
          <Link
            href="/"
            className="text-ink-muted hover:text-ink text-[0.8125rem] transition-colors"
          >
            返回首页
          </Link>
        </div>
      </header>

      <article className="relative z-10 mx-auto max-w-measure px-5 py-16 sm:px-8 sm:py-24">
        <header className="border-line-subtle mb-12 border-b pb-10">
          <p className="type-label text-brand mb-5">星驰视界规则文件</p>
          <h1 className="type-h1 text-ink text-balance">{title}</h1>
          <p className="type-lede text-ink-muted mt-5">{summary}</p>
          {/* Set as a labelled metadata pair with tabular figures — a
              date a reader may need to cite, not a sentence. */}
          <dl className="border-line-subtle mt-8 flex items-center gap-3 border-t pt-5">
            <dt className="type-label text-ink-faint">生效日期</dt>
            <dd className="numeral text-ink-muted text-[0.8125rem]">
              {effectiveDate}
            </dd>
          </dl>
        </header>

        <div className="flex flex-col gap-11">{children}</div>

        <nav className="border-line-subtle mt-16 flex flex-wrap gap-x-6 gap-y-3 border-t pt-8 text-[0.8125rem]">
          <Link
            className="text-ink-muted hover:text-ink transition-colors"
            href={siteConfig.links.terms}
          >
            用户协议
          </Link>
          <Link
            className="text-ink-muted hover:text-ink transition-colors"
            href={siteConfig.links.privacy}
          >
            隐私政策
          </Link>
          <Link
            className="text-ink-muted hover:text-ink transition-colors"
            href={siteConfig.links.pointsPolicy}
          >
            积分购买及退款规则
          </Link>
        </nav>
      </article>

      <footer className="border-line-subtle line-t px-5 py-10 sm:px-8">
        <dl className="text-ink-faint mx-auto grid max-w-measure gap-3 text-xs sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="shrink-0">运营主体</dt>
            <dd className="text-ink-muted">{siteConfig.operator}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0">客服邮箱</dt>
            <dd>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="text-ink-muted hover:text-ink transition-colors"
              >
                {siteConfig.supportEmail}
              </a>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0">客服电话</dt>
            <dd>
              <a
                href={`tel:${siteConfig.supportPhone}`}
                className="numeral text-ink-muted hover:text-ink transition-colors"
              >
                {siteConfig.supportPhone}
              </a>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0">备案号</dt>
            <dd>
              <a
                href={siteConfig.icpUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink-muted hover:text-ink transition-colors"
              >
                {siteConfig.icpNumber}
              </a>
            </dd>
          </div>
        </dl>
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
      <h2 className="type-h3 text-ink mb-4">{title}</h2>
      {/* Looser leading than the marketing copy: these are long, clause-
          heavy paragraphs that a reader has to work through carefully. */}
      <div className="text-ink-muted flex flex-col gap-4 text-[0.9375rem] leading-[1.85]">
        {children}
      </div>
    </section>
  );
}
