"use client";

import { motion, useReducedMotion } from "motion/react";
import { BorderBeam } from "@/components/ui/border-beam";
import { openLeadCapture } from "@/components/lead/LeadCapture";
import { cn } from "@/lib/utils";

export interface ReadyButtonProps {
  className?: string;
  variant?: "primary" | "secondary";
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<ReadyButtonProps["size"]>, string> = {
  sm: "px-[18px] py-[10px] text-[11px] tracking-[0.18em]",
  md: "px-[28px] py-[14px] text-[12px] tracking-[0.2em]",
  lg: "px-[36px] py-[18px] text-[13px] tracking-[0.22em]",
};

const primaryClasses =
  "border border-transparent bg-[linear-gradient(180deg,#5a2030_0%,#4a1c26_60%,#3a141d_100%)] text-[#fff5f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_32px_-10px_rgba(74,28,38,0.5)] hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,#632638_0%,#4a1c26_58%,#321019_100%)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_36px_-10px_rgba(74,28,38,0.62),0_0_0_4px_rgba(217,155,161,0.18)]";

const secondaryClasses =
  "border border-[rgba(244,163,170,0.5)] bg-transparent text-[#f4a3aa] hover:text-[#fff5f1] hover:border-[#f4a3aa] hover:bg-[rgba(244,163,170,0.08)]";

export default function ReadyButton({
  className,
  variant = "primary",
  label = "Ready to be heard?",
  size = "md",
}: ReadyButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const sharedClassName = cn(
    "group relative isolate overflow-hidden rounded-full font-dm-mono font-medium uppercase transition-all duration-300",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-4 focus-visible:ring-[rgba(217,155,161,0.4)] active:translate-y-px",
    "inline-flex items-center justify-center cursor-pointer",
    sizeClasses[size],
    variant === "primary" ? primaryClasses : secondaryClasses,
    className,
  );

  return (
    <motion.button
      type="button"
      onClick={openLeadCapture}
      data-lead-open
      data-cta="open-form"
      whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 400, damping: 28, mass: 1 }
      }
      className={sharedClassName}
    >
      {variant === "primary" && (
        <BorderBeam
          size={80}
          duration={8}
          colorFrom="#f4a3aa"
          colorTo="#d97580"
          borderWidth={1.5}
        />
      )}
      <span className="relative z-10 inline-flex items-center">
        {label}
        <span
          aria-hidden="true"
          className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </motion.button>
  );
}
