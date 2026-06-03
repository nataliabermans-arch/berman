"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

import PressTile from "@/components/atoms/PressTile";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

export interface PressWallProps {
  logos: {
    src: string;
    alt: string;
    href?: string;
  }[];
  heading?: string;
  className?: string;
}

/**
 * Press proof wall with static mobile tiles and a two-row marquee on large screens.
 * Soft fade edges keep the logo field contained.
 */
export function PressWall({
  logos,
  heading = "As featured in",
  className,
}: PressWallProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.3,
    margin: "-10% 0px -30% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const midpoint = Math.ceil(logos.length / 2);
  const firstRow = logos.slice(0, midpoint);
  const secondRow = logos.slice(midpoint);
  const tileTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="press-wall-heading"
      className={cn(
        "overflow-hidden bg-white px-container py-section-tight",
        className,
      )}
    >
      <div className="mx-auto max-w-content-max text-center">
        <h2
          id="press-wall-heading"
          className="font-dm-mono text-[0.72rem] uppercase tracking-[0.22em] text-text-tertiary"
        >
          {heading}
        </h2>

        <div className="relative mt-8 lg:hidden">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {logos.map((logo, index) => (
              <motion.div
                key={`${logo.alt}-${logo.src}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={
                  prefersReducedMotion || isInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{
                  ...tileTransition,
                  delay: prefersReducedMotion ? 0 : index * 0.06,
                }}
              >
                <PressTile
                  logoSrc={logo.src}
                  logoAlt={logo.alt}
                  href={logo.href}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative mt-10 hidden overflow-hidden py-4 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-24 before:bg-linear-to-r before:from-white before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-24 after:bg-linear-to-l after:from-white after:to-transparent lg:block">
          <Marquee pauseOnHover repeat={3} className="[--gap:1rem]">
            {firstRow.map((logo, index) => (
              <motion.div
                key={`top-${logo.alt}-${logo.src}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={
                  prefersReducedMotion || isInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{
                  ...tileTransition,
                  delay: prefersReducedMotion ? 0 : index * 0.06,
                }}
              >
                <PressTile
                  logoSrc={logo.src}
                  logoAlt={logo.alt}
                  href={logo.href}
                  className="w-44"
                />
              </motion.div>
            ))}
          </Marquee>
          {secondRow.length ? (
            <Marquee
              pauseOnHover
              reverse
              repeat={3}
              className="mt-4 [--gap:1rem]"
            >
              {secondRow.map((logo, index) => (
                <motion.div
                  key={`bottom-${logo.alt}-${logo.src}`}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={
                    prefersReducedMotion || isInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{
                    ...tileTransition,
                    delay: prefersReducedMotion
                      ? 0
                      : (firstRow.length + index) * 0.06,
                  }}
                >
                  <PressTile
                    logoSrc={logo.src}
                    logoAlt={logo.alt}
                    href={logo.href}
                    className="w-44"
                  />
                </motion.div>
              ))}
            </Marquee>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default PressWall;
