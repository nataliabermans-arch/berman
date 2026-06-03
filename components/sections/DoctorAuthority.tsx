"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import StatCard from "@/components/atoms/StatCard";
import CredentialColumns from "@/components/composites/CredentialColumns";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DoctorAuthorityProps {
  eyebrow?: string;
  heading: string;
  bio: string;
  stats: {
    value: string;
    suffix?: string;
    label: string;
  }[];
  credentials: {
    heading: string;
    items: string[];
  }[];
  cta?: {
    label: string;
    href: string;
  };
  portraitSrc?: string;
  className?: string;
}

/**
 * Authority split section with physician portrait, bio, stats, credentials, and CTA.
 * Missing headshots render a marked placeholder for asset replacement.
 */
export function DoctorAuthority({
  eyebrow = "Meet your doctor",
  heading,
  bio,
  stats,
  credentials,
  cta,
  portraitSrc,
  className,
}: DoctorAuthorityProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.3,
    margin: "-10% 0px -30% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const enter = (delay = 0) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y: 18 },
    animate:
      prefersReducedMotion || isInView
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: 18 },
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="doctor-authority-heading"
      className={cn("bg-surface-soft px-container py-section", className)}
    >
      <div className="mx-auto grid max-w-content-max gap-10 rounded-lg border border-line bg-white p-5 shadow-card lg:grid-cols-[0.82fr_1.18fr] lg:p-10">
        <Card className="rounded-lg border border-line bg-rose-soft p-4 shadow-subtle">
          <div className="aspect-[4/5] overflow-hidden rounded-md bg-rose-mesh">
            {portraitSrc ? (
              <img
                src={portraitSrc}
                alt="Dr. Jennifer Berman headshot"
                className="size-full object-cover"
              />
            ) : (
              <div
                data-needs-asset="dr-headshot"
                className="flex size-full items-center justify-center px-8 text-center font-cormorant text-5xl italic leading-none text-rose-900/65"
              >
                Dr. Jennifer Berman
              </div>
            )}
          </div>
          <div className="px-2 pb-2 pt-5">
            <p className="font-cormorant text-4xl font-medium italic leading-none text-ink">
              Dr. Jennifer Berman
            </p>
            <p className="mt-2 font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-tertiary">
              MD, Urologist
            </p>
          </div>
        </Card>

        <div className="py-2 lg:py-4">
          <p className="font-dm-mono text-[0.72rem] uppercase tracking-[0.22em] text-rose-700">
            {eyebrow}
          </p>
          <h2
            id="doctor-authority-heading"
            className="mt-4 font-cormorant text-display-2 font-medium leading-none text-ink"
          >
            {heading}
          </h2>
          <motion.p
            {...enter(0)}
            className="mt-6 font-cormorant text-3xl font-normal leading-snug text-text-primary lg:text-4xl"
          >
            {bio}
          </motion.p>

          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={`${stat.value}-${stat.label}`}
                {...enter(0.1 + index * 0.3)}
              >
                <StatCard
                  value={Number.parseFloat(stat.value) || 0}
                  suffix={stat.suffix}
                  label={stat.label}
                  variant="rose"
                />
              </motion.div>
            ))}
          </div>

          <motion.div {...enter(0.1 + stats.length * 0.3)}>
            <CredentialColumns columns={credentials} className="mt-10" />
          </motion.div>

          {cta ? (
            <motion.div {...enter(0.2 + stats.length * 0.3)} className="mt-9">
              <GlowCtaButton href={cta.href}>{cta.label}</GlowCtaButton>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default DoctorAuthority;
