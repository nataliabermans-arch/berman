"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useRef } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AuroraText } from "@/components/ui/aurora-text";
import { cn } from "@/lib/utils";

export interface HeroAuroraProps {
  eyebrow?: string;
  headline: string;
  italicWord?: string;
  sub: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  portraitSrc?: string;
  className?: string;
}

/**
 * Full-bleed aurora hero with pointer-tracked CSS variables and editorial portrait frame.
 * Highlights one optional italic word with the rose text gradient.
 */
export function HeroAurora({
  eyebrow = "Dr. Jennifer Berman, MD",
  headline,
  italicWord,
  sub,
  primaryCta,
  secondaryCta,
  portraitSrc,
  className,
}: HeroAuroraProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    if (prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    targetRef.current.x = event.clientX - rect.left;
    targetRef.current.y = event.clientY - rect.top;

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(updatePointerVars);
    }
  }

  function updatePointerVars() {
    const section = sectionRef.current;
    if (!section) {
      rafRef.current = null;
      return;
    }

    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.12;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.12;
    section.style.setProperty("--mx", `${currentRef.current.x}px`);
    section.style.setProperty("--my", `${currentRef.current.y}px`);

    const deltaX = Math.abs(targetRef.current.x - currentRef.current.x);
    const deltaY = Math.abs(targetRef.current.y - currentRef.current.y);
    rafRef.current =
      deltaX > 0.5 || deltaY > 0.5
        ? requestAnimationFrame(updatePointerVars)
        : null;
  }

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const words = headline.split(" ");
  const entranceTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };
  const cascadeTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      ref={sectionRef}
      aria-label="Berman women's wellness hero"
      onMouseMove={handleMouseMove}
      className={cn(
        "relative isolate min-h-[90vh] overflow-hidden bg-ink-aurora text-white",
        className,
      )}
    >
      <AuroraBackground
        className="absolute inset-0 h-full min-h-full bg-transparent text-white"
        showRadialGradient={false}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={
            {
              background:
                "radial-gradient(520px circle at var(--mx,70%) var(--my,30%), rgba(217,155,161,0.38), transparent 62%)",
            } as CSSProperties
          }
        />
      </AuroraBackground>

      <LazyMotion strict features={domAnimation}>
        {!prefersReducedMotion ? (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <m.div
              className="absolute left-[8%] top-[12%] size-56 rounded-full bg-rose-300/18 blur-3xl"
              animate={{
                transform: [
                  "translate3d(0px, 0px, 0)",
                  "translate3d(40px, -30px, 0)",
                  "translate3d(0px, 0px, 0)",
                ],
              }}
              transition={{
                duration: 18,
                ease: [0.65, 0, 0.35, 1],
                repeat: Infinity,
              }}
            />
            <m.div
              className="absolute bottom-[16%] right-[10%] size-72 rounded-full bg-rose-500/14 blur-3xl"
              animate={{
                transform: [
                  "translate3d(0px, 0px, 0)",
                  "translate3d(-36px, 30px, 0)",
                  "translate3d(0px, 0px, 0)",
                ],
              }}
              transition={{
                duration: 24,
                ease: [0.65, 0, 0.35, 1],
                repeat: Infinity,
              }}
            />
          </div>
        ) : null}

        <div className="relative z-10 mx-auto grid min-h-[90vh] max-w-content-max items-center gap-12 px-container py-section lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <m.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...cascadeTransition,
                delay: prefersReducedMotion ? 0 : 0.12,
              }}
              className="font-dm-mono text-[0.72rem] uppercase tracking-[0.22em] text-rose-100"
            >
              {eyebrow}
            </m.p>
            <h1 className="mt-6 max-w-4xl font-cormorant text-display-1 font-medium leading-[0.96]">
              {words.map((word, index) => {
                const bareWord = word.replace(/[.,!?;:]/g, "");
                const isItalic =
                  italicWord &&
                  bareWord.toLowerCase() === italicWord.toLowerCase();

                return (
                  <m.span
                    key={`${word}-${index}`}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 14 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      ...entranceTransition,
                      delay: prefersReducedMotion ? 0 : index * 0.06,
                    }}
                    className="inline-block"
                    style={{
                      willChange: prefersReducedMotion
                        ? undefined
                        : "transform, opacity",
                    }}
                  >
                    {isItalic ? (
                      <AuroraText
                        colors={["#ffeae0", "#f4a3aa", "#d97580"]}
                        className="italic"
                      >
                        {word}
                      </AuroraText>
                    ) : (
                      word
                    )}
                    {index < words.length - 1 ? "\u00a0" : ""}
                  </m.span>
                );
              })}
            </h1>
            <m.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...cascadeTransition,
                delay: prefersReducedMotion ? 0 : 0.2,
              }}
              className="mt-7 max-w-2xl font-inter text-lead text-white/78"
            >
              {sub}
            </m.p>
            <m.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...cascadeTransition,
                delay: prefersReducedMotion ? 0 : 0.28,
              }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <GlowCtaButton href={primaryCta.href} variant="primary" size="lg">
                {primaryCta.label}
              </GlowCtaButton>
              {secondaryCta ? (
                <GlowCtaButton
                  href={secondaryCta.href}
                  variant="ghost"
                  size="lg"
                  className="text-white hover:text-rose-100"
                >
                  {secondaryCta.label}
                </GlowCtaButton>
              ) : null}
            </m.div>
          </div>

          <m.div
            initial={
              prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            }
            className="relative mx-auto w-full max-w-md lg:max-w-lg"
          >
            <div
              className="absolute -inset-8 rounded-[42%] bg-rose-mesh opacity-50 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-white/18 bg-white/8 shadow-lift-rose backdrop-blur-sm">
              {portraitSrc ? (
                <img
                  src={portraitSrc}
                  alt="Dr. Jennifer Berman portrait"
                  className="size-full object-cover"
                />
              ) : (
                <div
                  data-needs-asset="hero-portrait"
                  className="flex size-full items-center justify-center bg-gradient-to-br from-white/16 to-rose-300/18 px-10 text-center font-cormorant text-5xl italic leading-none text-white/72"
                >
                  Dr. Jennifer Berman
                </div>
              )}
            </div>
          </m.div>
        </div>
      </LazyMotion>
    </section>
  );
}

export default HeroAurora;
