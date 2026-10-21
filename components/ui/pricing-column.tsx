import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button, type ButtonVariantProp } from "./button";
import { Spotlight } from "./spotlight";

const pricingColumnVariants = cva(
  "relative flex flex-col overflow-hidden rounded-3xl border p-7 transition-[border-color,box-shadow] duration-300 sm:p-8",
  {
    variants: {
      variant: {
        default:
          "border-line bg-surface-2 text-ink shadow-sm hover:border-line-strong hover:shadow-lg",
        /* A blue hairline marks the recommendation on the same white card. */
        featured:
          "border-brand/40 bg-surface-2 text-ink ring-1 ring-brand/10 shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface PricingColumnProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pricingColumnVariants> {
  name: string;
  icon?: ReactNode;
  description: string;
  price: number;
  billingPeriod?: string;
  originalPrice?: number;
  promotionText?: ReactNode;
  priceNote: string;
  featuredLabel?: string;
  cta: {
    variant?: ButtonVariantProp;
    label: string;
    href: string;
  };
  features: string[];
}

export function PricingColumn({
  name,
  icon,
  description,
  price,
  billingPeriod,
  originalPrice,
  promotionText,
  priceNote,
  featuredLabel = "推荐",
  cta,
  features,
  variant,
  className,
  ...props
}: PricingColumnProps) {
  const isFeatured = variant === "featured";
  const discounted =
    originalPrice !== undefined && originalPrice > 0 && price !== originalPrice;

  return (
    <Spotlight
      className={cn(pricingColumnVariants({ variant }), className)}
      {...props}
    >
      {isFeatured && (
        <>
          <span
            aria-hidden="true"
            className="hairline-live absolute inset-x-0 top-0 h-px"
          >
            <span className="via-brand/50 absolute inset-0 bg-linear-to-r from-transparent to-transparent" />
            <span className="hairline-live-beam motion-safe:animate-sweep absolute inset-y-0 w-1/2 motion-reduce:hidden" />
          </span>
        </>
      )}

      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="type-h3 text-ink flex items-center gap-2.5">
            {icon && (
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full border",
                  isFeatured
                    ? "border-gold/35 bg-gold-muted text-gold"
                    : "border-line bg-surface-3 text-ink-muted",
                )}
              >
                {icon}
              </span>
            )}
            {name}
          </h3>
          {isFeatured && (
            <span className="border-gold/35 bg-gold-muted text-gold rounded-full border px-2.5 py-0.5 text-[0.75rem] font-medium">
              {featuredLabel}
            </span>
          )}
        </div>
        {/* Reserves two lines so the price row aligns across the grid. */}
        <p className="type-copy-sm text-ink-muted min-h-[3.32em]">
          {description}
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-1">
        {discounted && (
          <span className="numeral text-ink-faint text-sm line-through">
            ¥{originalPrice}
          </span>
        )}
        <div className="flex items-end gap-1.5">
          <span className="text-ink-muted mb-1.5 text-xl font-medium">¥</span>
          <span className="numeral text-ink text-[3.75rem] leading-[0.92] font-semibold tracking-[-0.045em]">
            {price}
          </span>
          {billingPeriod && (
            <span className="text-ink-faint mb-1 ml-1.5 text-[0.8125rem]">
              {billingPeriod}
            </span>
          )}
        </div>
        {promotionText && (
          <span className="text-gold text-sm font-medium">{promotionText}</span>
        )}
      </div>

      <Button
        variant={cta.variant ?? (isFeatured ? "ink" : "secondary")}
        size="lg"
        className="mt-7 w-full"
        asChild
      >
        <Link href={cta.href}>{cta.label}</Link>
      </Button>

      <p className="text-ink-faint mt-3.5 min-h-[3.2em] text-[0.8125rem] leading-[1.6]">
        {priceNote}
      </p>

      <div aria-hidden="true" className="rule-fade my-5" />

      <ul className="flex flex-col gap-3">
        {features.map((feature, index) => (
          <li
            key={`${feature}-${index}`}
            className="type-copy-sm text-ink-muted flex items-start gap-3"
          >
            <span
              className={cn(
                "mt-[0.2em] grid size-[1.1rem] shrink-0 place-items-center rounded-full",
                isFeatured
                  ? "bg-gold-muted text-gold"
                  : "bg-brand-muted text-brand",
              )}
            >
              <CheckIcon
                aria-hidden="true"
                className="size-3"
                strokeWidth={2.5}
              />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Spotlight>
  );
}

export { pricingColumnVariants };
