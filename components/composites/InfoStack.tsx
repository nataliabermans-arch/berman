"use client";

import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface InfoStackProps {
  items: {
    label: string;
    value: string | ReactNode;
    icon?: ReactNode;
  }[];
  className?: string;
}

/**
 * Contact information stack for address, phone, and hours content.
 * Appends a neutral map placeholder until the embed asset is provided.
 */
export function InfoStack({ items, className }: InfoStackProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border border-line bg-white p-0 shadow-card",
        className,
      )}
    >
      <div className="p-6">
        {items.map((item, index) => (
          <div key={item.label}>
            {index > 0 ? <Separator className="my-5 bg-line" /> : null}
            <div className="flex gap-4">
              {item.icon ? (
                <div className="grid size-10 shrink-0 place-items-center rounded-full border border-line-rose bg-rose-50 text-rose-700">
                  {item.icon}
                </div>
              ) : null}
              <div>
                <p className="font-dm-mono text-[0.65rem] uppercase tracking-[0.18em] text-text-tertiary">
                  {item.label}
                </p>
                <div className="mt-2 font-inter text-base leading-7 text-text-primary">
                  {item.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        data-needs-asset="map-embed"
        className="grid min-h-64 place-items-center border-t border-line bg-neutral-100 p-6 text-center"
      >
        <p className="font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-tertiary">
          [Map will appear here]
        </p>
      </div>
    </Card>
  );
}

export default InfoStack;
