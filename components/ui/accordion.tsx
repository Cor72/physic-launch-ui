"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { PlusIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      /* First item carries a top rule too, so the stack reads as a ruled
         list with closed ends rather than a set of rows trailing off.
         Radix sets data-state on the Item, so the open row can strengthen
         its own rule without a :has() lookup. */
      className={cn(
        "border-line-subtle border-b transition-colors first:border-t",
        "data-[state=open]:border-line",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group text-ink flex flex-1 items-start justify-between gap-6 py-5 text-left",
          "text-[0.9375rem] font-medium tracking-[-0.011em]",
          /* `hover:underline` on a 15px Chinese line sets the rule straight
             through the character bodies; a colour shift reads cleaner. */
          "hover:text-brand transition-colors duration-150 outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        {/* A plus that rotates into a minus — unambiguous about what the
            control does, where a chevron only hints at direction. */}
        <PlusIcon
          aria-hidden="true"
          className="text-ink-faint group-hover:text-brand mt-0.5 size-4 shrink-0 transition-[transform,color] duration-200 ease-out group-data-[state=open]:rotate-45"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden"
      {...props}
    >
      <div className={cn("pr-10 pb-5", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
