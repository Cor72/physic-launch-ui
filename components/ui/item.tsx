import * as React from "react";

import { cn } from "@/lib/utils";

/* A feature card, not a bare text stack. The stock `Item` was a flex column
   with p-4 and no edge, so the features grid read as six loose paragraphs
   floating on the page with no sense of being a set. */
function Item({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item"
      className={cn(
        "group border-line bg-surface-2 relative flex flex-col gap-3.5 rounded-xl border p-6",
        "transition-[border-color,box-shadow] duration-200 ease-out",
        "hover:border-line-strong hover:shadow-md",
        /* The accent hairline across the top only resolves on hover, so the
           grid stays quiet until the eye actually lands on a card. */
        "before:bg-brand before:absolute before:inset-x-5 before:top-0 before:h-px",
        "before:opacity-0 before:transition-opacity before:duration-200",
        "hover:before:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

/* Icon housing — a recessed square bezel, matching the instrument framing
   used on the mockups and the workflow rail. */
function ItemIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-icon"
      className={cn(
        "border-line bg-surface-3 text-ink grid size-9 shrink-0 place-items-center rounded-lg border",
        "transition-colors duration-200 group-hover:border-brand/35 group-hover:text-brand",
        className,
      )}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="item-title"
      className={cn("type-h3 text-ink", className)}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      /* The stock max-w-[240px] clipped the measure to roughly 11 Chinese
         characters inside a 356px grid cell, forcing four ragged lines. */
      className={cn("type-copy-sm text-ink-muted", className)}
      {...props}
    />
  );
}

/* Monospace index in the card's top-right corner. */
function ItemIndex({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="item-index"
      aria-hidden="true"
      className={cn(
        "type-label numeral text-ink-faint absolute top-6 right-6",
        className,
      )}
      {...props}
    />
  );
}

export { Item, ItemDescription, ItemIcon, ItemIndex, ItemTitle };
