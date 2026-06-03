"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

import StoryMiniCard from "@/components/atoms/StoryMiniCard";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

export interface StoriesFeatureProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  stories: {
    photoSrc?: string;
    name: string;
    age?: string;
    treatment: string;
    quote: string;
  }[];
  className?: string;
}

/**
 * Patient story feature section with top-left editorial copy and horizontal story cards.
 * Uses native horizontal scroll on mobile and marquee on larger screens.
 */
export function StoriesFeature({
  eyebrow = "Patient stories",
  heading,
  intro,
  stories,
  className,
}: StoriesFeatureProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.3,
    margin: "-10% 0px -30% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const cardTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="stories-feature-heading"
      className={cn(
        "overflow-hidden bg-rose-mesh px-container py-section",
        className,
      )}
    >
      <div className="mx-auto max-w-content-max">
        <div className="max-w-2xl">
          <p className="font-dm-mono text-[0.72rem] uppercase tracking-[0.22em] text-rose-700">
            {eyebrow}
          </p>
          <h2
            id="stories-feature-heading"
            className="mt-4 font-cormorant text-display-2 font-medium leading-none text-ink"
          >
            {heading}
          </h2>
          {intro ? (
            <p className="mt-5 font-inter text-lead text-text-secondary">
              {intro}
            </p>
          ) : null}
        </div>

        <div className="-mx-container mt-10 overflow-x-auto px-container pb-3 lg:hidden">
          <div className="flex min-w-max gap-4">
            {stories.map((story, index) => (
              <motion.div
                key={`${story.name}-${index}`}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                animate={
                  prefersReducedMotion || isInView
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -20 }
                }
                transition={{
                  ...cardTransition,
                  delay: prefersReducedMotion ? 0 : index * 0.08,
                }}
              >
                <StoryMiniCard {...story} className="w-80 bg-white" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative mt-10 hidden overflow-hidden before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-28 before:bg-linear-to-r before:from-rose-50 before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-28 after:bg-linear-to-l after:from-rose-50 after:to-transparent lg:block">
          <Marquee pauseOnHover repeat={3} className="[--gap:1rem]">
            {stories.map((story, index) => (
              <motion.div
                key={`${story.name}-${index}`}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                animate={
                  prefersReducedMotion || isInView
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -20 }
                }
                transition={{
                  ...cardTransition,
                  delay: prefersReducedMotion ? 0 : index * 0.08,
                }}
              >
                <StoryMiniCard {...story} className="w-80 bg-white" />
              </motion.div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

export default StoriesFeature;
