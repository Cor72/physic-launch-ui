import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full text-[0.75rem] font-medium tracking-[-0.004em] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand text-primary-foreground",
        brand: "bg-brand text-primary-foreground",
        "brand-secondary": "bg-brand-muted text-brand",
        secondary: "bg-surface-3 text-ink-muted",
        destructive:
          "border-destructive/25 bg-destructive/10 text-destructive-foreground border",
        /* The page's default chip: a hairline capsule on the raised
           surface. Reads as a control, not a label sticker. */
        outline: "border-line bg-surface-2 text-ink-muted border shadow-sm",
      },
      size: {
        default: "px-3 py-1",
        sm: "px-2 py-0.5 text-[0.6875rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
