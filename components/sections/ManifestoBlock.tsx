"use client";

import { useRef } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
  useReducedMotion,
} from "motion/react";

import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

export interface ManifestoBlockProps {
  eyebrow?: string;
  manifesto: string;
  signature?: {
    name: string;
    title: string;
    portraitSrc?: string;
  };
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
}

/**
 * Blush two-up manifesto section with portrait/signature card and oversized italic copy.
 * The first sentence fragment receives rose emphasis for editorial contrast.
 */
export function ManifestoBlock({
  eyebrow = "A note from your doctor",
  manifesto,
  signature = {
    name: "Dr. Jennifer Berman",
    title: "Urologist and women's wellness physician",
  },
  cta,
  className,
}: ManifestoBlockProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.4,
    margin: "-10% 0px -30% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const [lead] = manifesto.split(". ");
  const leadWordCount = lead.split(" ").length;
  const words = manifesto.split(" ");
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="manifesto-heading"
      className={cn(
        "relative isolate overflow-hidden bg-rose-soft px-container py-section",
        className,
      )}
    >
      <Spotlight fill="#8a3a44" className="-left-1/4 top-0 opacity-20" />
      <LazyMotion strict features={domAnimation}>
        {!prefersReducedMotion ? (
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 top-12 size-96 rounded-full bg-rose-mesh opacity-30 blur-2xl"
            animate={{ transform: "rotate(360deg)" }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          />
        ) : null}
        <div className="relative z-10 mx-auto grid max-w-content-max gap-10 lg:grid-cols-[0.9fr_1.25fr] lg:items-center">
          <div className="rounded-lg border border-line bg-white/72 p-4 shadow-lift backdrop-blur-sm">
            <div className="aspect-[4/5] overflow-hidden rounded-md bg-rose-mesh">
              {signature.portraitSrc ? (
                <img
                  src={signature.portraitSrc}
                  alt={`${signature.name} portrait`}
                  className="size-full object-cover"
                />
              ) : (
                <div
                  data-needs-asset="dr-portrait"
                  className="flex size-full items-center justify-center px-8 text-center font-cormorant text-5xl italic leading-none text-rose-900/65"
                >
                  {signature.name}
                </div>
              )}
            </div>
            <div className="mt-5 border-t border-line pt-5">
              <p className="font-cormorant text-3xl font-medium italic leading-none text-ink">
                {signature.name}
              </p>
              <p className="mt-2 font-dm-mono text-[0.66rem] uppercase tracking-[0.18em] text-text-tertiary">
                {signature.title}
              </p>
            </div>
          </div>

          <div>
            <p
              id="manifesto-heading"
              className="font-dm-mono text-[0.72rem] uppercase tracking-[0.22em] text-rose-700"
            >
              {eyebrow}
            </p>
            <blockquote className="mt-6 font-cormorant text-display-2 font-normal italic leading-[1.02] text-ink">
              {words.map((word, index) => {
                const isLeadWord = index < leadWordCount;

                return (
                  <m.span
                    key={`${word}-${index}`}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 16 }
                    }
                    animate={
                      prefersReducedMotion || isInView
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 16 }
                    }
                    transition={{
                      ...transition,
                      delay: prefersReducedMotion ? 0 : index * 0.08,
                    }}
                    className={cn(
                      "inline-block",
                      isLeadWord && "text-rose-700",
                    )}
                    style={{
                      willChange:
                        prefersReducedMotion || isInView
                          ? undefined
                          : "transform, opacity",
                    }}
                  >
                    {word}
                    {index < words.length - 1 ? "\u00a0" : ""}
                  </m.span>
                );
              })}
            </blockquote>
            <m.span
              aria-hidden="true"
              initial={
                prefersReducedMotion
                  ? false
                  : { backgroundPosition: "100% 50%" }
              }
              animate={
                prefersReducedMotion || isInView
                  ? { backgroundPosition: "0% 50%" }
                  : { backgroundPosition: "100% 50%" }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 1.2, delay: 0.2, ease: [0.65, 0, 0.35, 1] }
              }
              className="mt-3 block h-1 w-32 rounded-full bg-linear-to-r from-rose-700 via-rose-300 to-rose-700 bg-[length:200%_100%]"
            />
            {cta ? (
              <div className="mt-9 flex justify-start lg:justify-end">
                <GlowCtaButton href={cta.href}>{cta.label}</GlowCtaButton>
              </div>
            ) : null}
          </div>
        </div>
      </LazyMotion>
    </section>
  );
}

export default ManifestoBlock;
