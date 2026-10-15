"use client";

import { CoinsIcon, SparklesIcon, WalletCardsIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { siteConfig } from "@/config/site";
import { createBrowserPlatformClient } from "@/lib/user-session";
import { cn } from "@/lib/utils";

import { PricingColumn, PricingColumnProps } from "../../ui/pricing-column";
import { Section } from "../../ui/section";

interface PricingProps {
  title?: string | false;
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
  description = "当前提供一次性积分包。购买成功后积分进入账户，长期有效，不会自动续费。",
  plans,
  className = "",
}: PricingProps) {
  const client = useMemo(() => createBrowserPlatformClient(), []);
  const [catalog, setCatalog] = useState<CatalogState>(initialCatalog);

  useEffect(() => {
    const controller = new AbortController();

    void client
      .GET("/api/v3/auth/bootstrap", {
        signal: controller.signal,
        cache: "no-store",
      })
      .then(({ data, response }) => {
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
        if (!controller.signal.aborted) {
          setCatalog((current) => ({ ...current, status: "error" }));
        }
      });

    return () => controller.abort();
  }, [client]);

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
          variant: "white",
          label: "开始免费体验",
          href: siteConfig.canvasUrl,
        },
        features: [
          "无需绑定支付方式",
          "体验基础画布操作",
          "查看首页实际演示",
        ],
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
          variant: "white",
          label: purchaseLabel,
          href: purchaseHref,
        },
        features: [
          "一次性购买，不自动续费",
          "积分长期有效，不会过期",
          "用于平台内数字内容与生成服务",
          "实际扣除以使用页面提示为准",
        ],
        variant: "glow-brand",
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
          variant: "white",
          label: purchaseLabel,
          href: purchaseHref,
        },
        features: [
          "一次性购买，不自动续费",
          "积分长期有效，不会过期",
          "用于平台内数字内容与生成服务",
          "实际扣除以使用页面提示为准",
        ],
        variant: "glow",
      });
    }

    return nextPlans;
  }, [catalog, plans]);

  return (
    <Section id="pricing" className={cn(className)}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
        {(title || description) && (
          <div className="flex flex-col items-center gap-4 px-4 text-center sm:gap-8">
            {title && (
              <h2 className="text-3xl leading-tight font-semibold text-balance sm:text-5xl sm:leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-md text-muted-foreground max-w-[680px] font-medium sm:text-xl">
                {description}
              </p>
            )}
          </div>
        )}

        {plans === undefined && catalog.status === "loading" ? (
          <div className="border-border bg-card/50 text-muted-foreground w-full max-w-2xl rounded-2xl border px-6 py-8 text-center text-sm">
            正在读取当前积分套餐
          </div>
        ) : null}

        {plans === undefined && catalog.status === "error" ? (
          <div className="border-border bg-card/50 w-full max-w-2xl rounded-2xl border px-6 py-8 text-center">
            <h3 className="font-semibold">付费套餐信息暂时无法加载</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              请稍后刷新页面，或通过客服邮箱 {siteConfig.supportEmail} 联系我们。
            </p>
          </div>
        ) : null}

        {plans !== false &&
        (plans !== undefined || catalog.status !== "loading") ? (
          <>
            <div
              className={cn(
                "mx-auto grid w-full grid-cols-1 gap-8",
                resolvedPlans.length === 1
                  ? "max-w-md"
                  : "max-w-container sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {resolvedPlans.map((plan) => (
                <PricingColumn key={plan.name} {...plan} />
              ))}
            </div>
            {catalog.status === "ready" && resolvedPlans.length === 1 ? (
              <p className="text-muted-foreground text-center text-sm">
                付费积分包目前未上架，请以账户购买页面显示为准。
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </Section>
  );
}
