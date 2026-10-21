import { type ComponentProps, type ReactNode } from "react";

import { Button, type ButtonVariantProp } from "./button";

export interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariantProp;
  icon?: ReactNode;
  iconRight?: ReactNode;
  size?: ComponentProps<typeof Button>["size"];
}

export function LinkButton({
  href,
  children,
  variant = "default",
  icon,
  iconRight,
  size = "lg",
}: LinkButtonProps) {
  return (
    <Button variant={variant} size={size} asChild>
      <a href={href}>
        {icon}
        {children}
        {iconRight}
      </a>
    </Button>
  );
}
