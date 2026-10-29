import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-medium tracking-[-0.006em]",
    "transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out",
    "active:translate-y-px motion-reduce:active:translate-y-0",
    "disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-brand text-brand-foreground",
          "shadow-[0_1px_2px_var(--shadow-contact),0_8px_20px_-6px_color-mix(in_oklab,var(--brand)_55%,transparent)]",
          "inset-shadow-[0_1px_0_oklch(100%_0_0/0.22)]",
          "hover:brightness-110",
          "disabled:bg-surface-3 disabled:text-ink-faint disabled:shadow-none disabled:inset-shadow-none",
        ],
        /* Solid ink: near-black on light surfaces, near-white on dark ones.
           The highest-contrast action on any band. */
        ink: [
          "bg-ink text-surface-1",
          "shadow-[0_1px_2px_var(--shadow-contact),0_10px_24px_-10px_var(--shadow-strong)]",
          "hover:opacity-90",
          "disabled:bg-surface-3 disabled:text-ink-faint disabled:shadow-none",
        ],
        secondary: [
          "border-line bg-surface-2 text-ink border",
          "shadow-sm inset-shadow-[0_1px_0_var(--highlight)]",
          "hover:border-line-strong hover:bg-surface-3",
          "disabled:opacity-50",
        ],
        glass: [
          "border-line text-ink border bg-[color-mix(in_oklab,var(--surface-2)_45%,transparent)] backdrop-blur-md",
          "inset-shadow-[0_1px_0_var(--highlight)]",
          "hover:border-line-strong hover:bg-[color-mix(in_oklab,var(--surface-3)_70%,transparent)]",
          "disabled:opacity-50",
        ],
        outline: [
          "border-line text-ink border bg-transparent",
          "hover:bg-surface-3 hover:border-line-strong",
          "disabled:opacity-50",
        ],
        ghost: "text-ink-muted hover:bg-surface-3 hover:text-ink disabled:opacity-50",
        glow: "glass-4 hover:glass-5 text-ink shadow-sm disabled:opacity-50",
        destructive: [
          "border-destructive/25 bg-destructive/10 text-destructive-foreground border",
          "hover:bg-destructive/15 disabled:opacity-50",
        ],
        link: "text-ink h-auto rounded-none p-0 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 text-[0.875rem]",
        xs: "h-7 px-2.5 text-[0.75rem]",
        sm: "h-8 px-3.5 text-[0.8125rem]",
        lg: "h-11 px-6 text-[0.9375rem]",
        xl: "h-12 px-7 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

/* `white` is the template's name for the neutral raised button and is still
   accepted so older call sites keep compiling. */
export type ButtonVariantProp = ButtonVariant | "white";

const VARIANT_ALIASES: Record<string, ButtonVariant> = { white: "secondary" };

function resolveVariant(variant?: ButtonVariantProp | null): ButtonVariant {
  if (!variant) return "default";
  return VARIANT_ALIASES[variant] ?? (variant as ButtonVariant);
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: Omit<React.ComponentProps<"button">, "color"> &
  Omit<VariantProps<typeof buttonVariants>, "variant"> & {
    variant?: ButtonVariantProp;
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant: resolveVariant(variant), size, className }),
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants, resolveVariant };
