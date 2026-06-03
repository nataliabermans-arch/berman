"use client";

import type { ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export interface FaqAccordionProps {
  items: {
    question: string;
    answer: string | ReactNode;
  }[];
  className?: string;
}

/**
 * Single-open FAQ accordion with editorial question styling.
 * Uses the local Base UI accordion primitive and rose open-state chevrons.
 */
export function FaqAccordion({ items, className }: FaqAccordionProps) {
  return (
    <Accordion className={cn("divide-y divide-line", className)}>
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`item-${index}`}>
          <AccordionTrigger className="py-6 font-cormorant text-2xl font-medium leading-tight text-text-primary no-underline hover:text-rose-700 hover:no-underline **:data-[slot=accordion-trigger-icon]:text-rose-700 **:data-[slot=accordion-trigger-icon]:transition-transform **:data-[slot=accordion-trigger-icon]:duration-300 group-aria-expanded/accordion-trigger:**:data-[slot=accordion-trigger-icon]:rotate-180">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-6 pr-8 font-inter text-base leading-7 text-text-secondary">
            {typeof item.answer === "string" ? (
              <p>{item.answer}</p>
            ) : (
              item.answer
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default FaqAccordion;
