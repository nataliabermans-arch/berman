"use client";

import type { MouseEventHandler, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";

export interface GlowCtaButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  lead?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<GlowCtaButtonProps["size"]>, string> = {
  sm: "px-[18px] py-[10px] text-[11px] tracking-[0.15em]",
  md: "px-[28px] py-[14px] text-[12px] tracking-[0.16em]",
  lg: "px-[36px] py-[18px] text-[13px] tracking-[0.18em]",
};

const variantClasses: Record<
  NonNullable<GlowCtaButtonProps["variant"]>,
  string
> = {
  primary:
    "border-transparent bg-[linear-gradient(180deg,#5a2030_0%,#4a1c26_60%,#3a141d_100%)] text-[#fff5f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_32px_-10px_rgba(74,28,38,0.5)] backdrop-blur-[10px] hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,#632638_0%,#4a1c26_58%,#321019_100%)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_36px_-10px_rgba(74,28,38,0.62),0_0_0_4px_rgba(217,155,161,0.18)] focus-visible:ring-[rgba(217,155,161,0.4)] before:absolute before:inset-y-0 before:left-[-35%] before:w-1/3 before:skew-x-[-18deg] before:bg-white/25 before:opacity-0 before:transition-all before:duration-500 hover:before:left-[115%] hover:before:opacity-100 after:absolute after:inset-[-2px] after:-z-10 after:rounded-[inherit] after:bg-[rgba(217,155,161,0.35)] after:opacity-0 after:blur-xl after:transition-opacity hover:after:opacity-80",
  secondary:
    "border-[1.5px] border-[#4a1c26] bg-[#fff5f1] text-[#4a1c26] shadow-none hover:-translate-y-0.5 hover:bg-[rgba(74,28,38,0.06)] focus-visible:ring-[rgba(217,155,161,0.4)] after:absolute after:inset-[-2px] after:-z-10 after:rounded-[inherit] after:bg-[rgba(217,155,161,0.22)] after:opacity-0 after:blur-lg after:transition-opacity hover:after:opacity-100",
  ghost:
    "border-transparent bg-transparent text-[#4a1c26] shadow-none hover:text-[#1a0a10] focus-visible:ring-[rgba(217,155,161,0.4)] before:absolute before:bottom-2 before:left-5 before:right-5 before:h-px before:origin-left before:scale-x-0 before:bg-[#4a1c26] before:transition-transform before:duration-300 hover:before:scale-x-100",
};

function isLeadHref(href?: string) {
  if (!href) return false;
  const clean = href.trim();
  return (
    clean === "#lead" ||
    clean === "#ready" ||
    clean === "/contact" ||
    clean === "/contact/"
  );
}

/**
 * Rose-accent CTA primitive that can render as a button or link.
 * Supports primary, secondary, and ghost treatments with CSS-only glow states.
 */
export function GlowCtaButton({
  children,
  href,
  onClick,
  lead = false,
  variant = "primary",
  size = "md",
  className,
}: GlowCtaButtonProps) {
  const opensLeadCapture = lead || isLeadHref(href);
  const leadTriggerProps = opensLeadCapture
    ? ({
        "data-lead-open": true,
        "data-cta": "open-form",
      } as const)
    : {};
  const sharedClassName = cn(
    "group relative isolate overflow-hidden rounded-full border font-dm-mono font-medium uppercase transition-all duration-300",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-4 active:translate-y-px",
    sizeClasses[size],
    variantClasses[variant],
    className,
  );
  const primaryBeam =
    variant === "primary" ? (
      <BorderBeam
        size={80}
        duration={8}
        colorFrom="#f4a3aa"
        colorTo="#d97580"
        borderWidth={1.5}
      />
    ) : null;

  if (href) {
    const linkHref = opensLeadCapture ? "/contact/" : href;

    return (
      <span className="inline-flex transition-transform duration-200 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]">
        <Button
          render={
            <a
              href={linkHref}
              onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
              {...leadTriggerProps}
            />
          }
          variant="ghost"
          size="lg"
          className={sharedClassName}
        >
          {primaryBeam}
          <span className="relative z-10 inline-flex items-center">
            {children}
            <span
              aria-hidden="true"
              className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </Button>
      </span>
    );
  }

  return (
    <span className="inline-flex transition-transform duration-200 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]">
      <Button
        type="button"
        onClick={onClick as MouseEventHandler<HTMLButtonElement>}
        {...leadTriggerProps}
        variant="ghost"
        size="lg"
        className={sharedClassName}
      >
        {primaryBeam}
        <span className="relative z-10 inline-flex items-center">
          {children}
          <span
            aria-hidden="true"
            className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </Button>
    </span>
  );
}

export default GlowCtaButton;
