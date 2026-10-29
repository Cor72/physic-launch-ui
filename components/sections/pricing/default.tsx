"use client";

import {
  CoinsIcon,
  InfinityIcon,
  ReceiptTextIcon,
  RefreshCwOffIcon,
  SparklesIcon,
  WalletCardsIcon,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { siteConfig } from "@/config/site";
import { createBrowserPlatformClient } from "@/lib/user-session";
import { cn } from "@/lib/utils";

import { PricingColumn, PricingColumnProps } from "../../ui/pricing-column";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeader,
  SectionLede,
  SectionTitle,
} from "../../ui/section";

/* Each line restates an answer from the FAQ below. */
const ASSURANCES: { icon: ReactNode; text: string }[] = [
  {
    icon: <RefreshCwOffIcon className="size-4" />,
    text: "一次性购买，不自动续费",
  },
  { icon: <InfinityIcon className="size-4" />, text: "积分长期有效，不会过期" },
  { icon: <ReceiptTextIcon className="size-4" />, text: "可联系客服开具发票" },
];

interface PricingProps {
  title?: string | false;
  eyebrow?: string;
  figure?: string;
  description?: string | false;
  plans?: PricingColumnProps[] | false;
  className?: string;
}

interface CatalogState {
  status: "loading" | "ready" | "error";
  signedIn: boolean;
  monthMinor: number | null;
  monthPoints: number | null;
  yearMinor: number | null;
  yearPoints: number | null;
}

const initialCatalog: CatalogState = {
  status: "loading",
  signedIn: false,
  monthMinor: null,
  monthPoints: null,
  yearMinor: null,
  yearPoints: null,
};

function formatYuan(minor: number) {
  return Number((minor / 100).toFixed(2));
}

export default function Pricing({
  title = "按需购买积分，不绑定订阅",
  eyebrow = "积分套餐",
  figure = "04",
  description = "当前提供一次性积分包。购买成功后积分进入账户，长期有效，不会自动续费。",
  plans,
  className = "",
}: PricingProps) {
  const client = useMemo(() => createBrowserPlatformClient(), []);
  const [catalog, setCatalog] = useState<CatalogState>(initialCatalog);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (plans !== undefined) return;
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8_000);

    void client
      .GET("/api/v3/auth/bootstrap", {
        signal: controller.signal,
        cache: "no-store",
      })
      .then(({ data, response }) => {
        if (!active) return;
        if (!response.ok || !data) throw new Error("CATALOG_UNAVAILABLE");
        setCatalog({
          status: "ready",
          signedIn: Boolean(data.account),
          monthMinor: data.catalog.monthMinor,
          monthPoints: data.catalog.monthPoints,
          yearMinor: data.catalog.yearMinor,
          yearPoints: data.catalog.yearPoints,
        });
      })
      .catch(() => {
        if (active && (!controller.signal.aborted || timedOut)) {
          setCatalog((current) => ({ ...current, status: "error" }));
        }
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [client, attempt, plans]);

  const resolvedPlans = useMemo<PricingColumnProps[]>(() => {
    if (plans !== undefined && plans !== false) return plans;

    const purchaseHref = catalog.signedIn
      ? siteConfig.canvasUrl
      : siteConfig.loginUrl;
    const purchaseLabel = catalog.signedIn ? "进入账户购买" : "登录后购买";
    const nextPlans: PricingColumnProps[] = [
      {
        name: "免费体验",
        icon: <SparklesIcon className="size-4" />,
        description: "适合先了解题目识别与动态画布的使用方式",
        price: 0,
        billingPeriod: "无需购买积分",
        priceNote: "可以进入画布体验当前开放的基础功能。",
        cta: {
          variant: "secondary",
          label: "开始免费体验",
          href: siteConfig.canvasUrl,
        },
        features: ["无需绑定支付方式", "体验基础画布操作", "查看首页实际演示"],
        variant: "default",
      },
    ];

    if (catalog.monthMinor !== null && catalog.monthPoints !== null) {
      nextPlans.push({
        name: `${catalog.monthPoints} 积分包`,
        icon: <CoinsIcon className="size-4" />,
        description: "适合日常学习、专题练习和按需生成",
        price: formatYuan(catalog.monthMinor),
        billingPeriod: "一次性购买",
        priceNote: "购买后积分计入当前账户，长期有效。",
        cta: {
          variant: "ink",
          label: purchaseLabel,
          href: purchaseHref,
        },
        features: [
          "一次性购买，不自动续费",
          "积分长期有效，不会过期",
          "用于平台内数字内容与生成服务",
          "实际扣除以使用页面提示为准",
        ],
        variant: "featured",
      });
    }

    if (catalog.yearMinor !== null && catalog.yearPoints !== null) {
      nextPlans.push({
        name: `${catalog.yearPoints} 积分包`,
        icon: <WalletCardsIcon className="size-4" />,
        description: "适合使用频率较高、希望一次购入更多积分的用户",
        price: formatYuan(catalog.yearMinor),
        billingPeriod: "一次性购买",
        priceNote: "不是月卡或年卡，不会产生周期扣费。",
        cta: {
          variant: "secondary",
          label: purchaseLabel,
          href: purchaseHref,
        },
        features: [
          "一次性购买，不自动续费",
          "积分长期有效，不会过期",
          "用于平台内数字内容与生成服务",
          "实际扣除以使用页面提示为准",
        ],
        variant: "default",
      });
    }

    return nextPlans;
  }, [catalog, plans]);

  return (
    <Section id="pricing" className={cn(className)}>
      <Container className="flex flex-col items-center gap-14">
        {(title || description) && (
          <SectionHeader align="center">
            <Eyebrow index={figure} className="justify-center">
              {eyebrow}
            </Eyebrow>
            {title && (
              <SectionTitle className="max-w-2xl">{title}</SectionTitle>
            )}
            {description && <SectionLede>{description}</SectionLede>}
          </SectionHeader>
        )}

        {/* Skeleton rather than a one-line "正在读取" notice, so the section
            does not collapse and then shove the page down when the catalog
            resolves. */}
        {plans === undefined && catalog.status === "loading" ? (
          <div
            aria-busy="true"
            aria-live="polite"
            className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <span className="sr-only">正在读取当前积分套餐</span>
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="border-line bg-surface-2 h-[34rem] animate-pulse rounded-3xl border"
              />
            ))}
          </div>
        ) : null}

        {plans === undefined && catalog.status === "error" ? (
          <div
            role="alert"
            className="border-line bg-surface-2 w-full max-w-xl rounded-2xl border px-6 py-8 text-center"
          >
            <h3 className="type-h3 text-ink">付费套餐信息暂时无法加载</h3>
            <p className="type-copy-sm text-ink-muted mt-2">
              可以重新加载套餐，或通过客服邮箱{" "}
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="text-ink decoration-line-strong underline underline-offset-4"
              >
                {siteConfig.supportEmail}
              </a>{" "}
              联系我们。
            </p>
            <button
              type="button"
              className="border-line text-brand hover:bg-brand-muted mt-5 min-h-11 rounded-full border px-5 text-sm font-medium transition-colors"
              onClick={() => {
                setCatalog((current) => ({ ...current, status: "loading" }));
                setAttempt((current) => current + 1);
              }}
            >
              重新加载套餐
            </button>
          </div>
        ) : null}

        {plans !== false &&
        (plans !== undefined || catalog.status !== "loading") ? (
          <>
            <div
              className={cn(
                "mx-auto grid w-full grid-cols-1 gap-5",
                resolvedPlans.length === 1
                  ? "max-w-sm"
                  : "sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {resolvedPlans.map((plan) => (
                <PricingColumn key={plan.name} {...plan} />
              ))}
            </div>
            {catalog.status === "ready" && resolvedPlans.length === 1 ? (
              <p className="type-copy-sm text-ink-faint text-center">
                付费积分包目前未上架，请以账户购买页面显示为准。
              </p>
            ) : null}
          </>
        ) : null}

        {/* The three answers people scroll to the FAQ for, stated here. */}
        <ul className="border-line-subtle text-ink-muted flex w-full flex-col items-center justify-center gap-x-10 gap-y-3 border-t pt-8 text-[0.875rem] sm:flex-row">
          {ASSURANCES.map((assurance) => (
            <li key={assurance.text} className="flex items-center gap-2.5">
              <span className="text-brand">{assurance.icon}</span>
              {assurance.text}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
