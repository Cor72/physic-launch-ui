import { User, Users } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import { PricingColumn, PricingColumnProps } from "../../ui/pricing-column";
import { Section } from "../../ui/section";

interface PricingProps {
  title?: string | false;
  description?: string | false;
  plans?: PricingColumnProps[] | false;
  className?: string;
}

const DEFAULT_PRICING_PLANS: PricingColumnProps[] = [
  {
    name: "基础体验",
    description: "适合初次尝试动态物理学习的学生与老师",
    price: siteConfig.pricing.free,
    billingPeriod: "免费体验",
    priceNote: "先观察示例场景，了解动态学习的方式。",
    cta: {
      variant: "glow",
      label: "观看免费演示",
      href: siteConfig.getStartedUrl,
    },
    features: [
      "题目与动态场景示例",
      "基础播放、暂停与回看",
      "了解首期五类模型规划",
    ],
    variant: "default",
  },
  {
    name: "月度会员",
    icon: <User className="size-4" />,
    description: "适合阶段性复习、专题练习与日常备课",
    price: siteConfig.pricing.monthly,
    billingPeriod: "/月",
    priceNote: "会员权益为规划示例，当前暂未开放购买。",
    cta: {
      variant: "white",
      label: "了解月度方案",
      href: siteConfig.links.faq,
    },
    features: [
      "规划支持拍照与文字识题",
      "可调参数的题目专属场景",
      "受力、速度与轨迹展示",
      "学习记录与关键节点回顾",
    ],
    variant: "glow-brand",
  },
  {
    name: "年度会员",
    icon: <Users className="size-4" />,
    description: "适合持续学习、系统复习与长期教学使用",
    price: siteConfig.pricing.yearly,
    billingPeriod: "/年",
    promotionText: `较连续月付一年节省 ${siteConfig.pricing.monthly * 12 - siteConfig.pricing.yearly} 元`,
    priceNote: `折合每月 ${siteConfig.pricing.yearly / 12} 元，规划权益与月度会员一致。`,
    cta: {
      variant: "white",
      label: "了解年度方案",
      href: siteConfig.links.faq,
    },
    features: [
      "包含月度会员全部规划权益",
      "覆盖一整年的学习与复习",
      "持续扩充的物理模型库",
      "教师讲授与课堂演示功能规划",
    ],
    variant: "glow",
  },
];

export default function Pricing({
  title = "选择适合自己的学习节奏",
  description = "先从免费演示开始，再选择月度或年度会员。以下权益为首版规划，当前页面仅展示方案，暂未开放购买。",
  plans = DEFAULT_PRICING_PLANS,
  className = "",
}: PricingProps) {
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
              <p className="text-md text-muted-foreground max-w-[600px] font-medium sm:text-xl">
                {description}
              </p>
            )}
          </div>
        )}
        {plans !== false && plans.length > 0 && (
          <div className="max-w-container mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PricingColumn
                key={plan.name}
                name={plan.name}
                icon={plan.icon}
                description={plan.description}
                price={plan.price}
                billingPeriod={plan.billingPeriod}
                originalPrice={plan.originalPrice}
                promotionText={plan.promotionText}
                priceNote={plan.priceNote}
                cta={plan.cta}
                features={plan.features}
                variant={plan.variant}
                className={plan.className}
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
