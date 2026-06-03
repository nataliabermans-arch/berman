"use client";

import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import CheckChip from "@/components/atoms/CheckChip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ServiceDetailHeroProps {
  eyebrow?: string;
  headline: string;
  italicWord?: string;
  sub: string;
  badges?: string[];
  quickFacts?: { label: string; value: string }[];
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  heroImageSrc?: string;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

function renderHeadline(headline: string, italicWord?: string) {
  if (!italicWord || !headline.includes(italicWord)) {
    return headline;
  }

  const [before, after] = headline.split(italicWord, 2);

  return (
    <>
      {before}
      <em className="bg-rose-text bg-clip-text font-normal italic text-transparent">
        {italicWord}
      </em>
      {after}
    </>
  );
}

/**
 * Two-up service detail hero with breadcrumbs, treatment badges, CTAs, and quick facts.
 * Missing hero media emits a service-hero asset placeholder.
 */
export function ServiceDetailHero({
  eyebrow,
  headline,
  italicWord,
  sub,
  badges,
  quickFacts,
  primaryCta,
  secondaryCta,
  heroImageSrc,
  breadcrumbs,
  className,
}: ServiceDetailHeroProps) {
  return (
    <section
      aria-labelledby="service-detail-hero-heading"
      className={cn(
        "overflow-hidden bg-rose-soft px-container py-section text-text-primary",
        className,
      )}
    >
      <div className="mx-auto grid max-w-content items-center gap-12 lg:grid-cols-[1.08fr_.82fr] lg:gap-16">
        <div>
          {breadcrumbs?.length ? (
            <nav
              aria-label="Breadcrumb"
              className="mb-8 font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-tertiary"
            >
              <ol className="flex flex-wrap items-center gap-2">
                {breadcrumbs.map((item, index) => (
                  <li
                    key={`${item.label}-${index}`}
                    className="flex items-center gap-2"
                  >
                    {item.href ? (
                      <a
                        href={item.href}
                        className="transition-colors hover:text-rose-700"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span aria-current="page">{item.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 ? (
                      <span aria-hidden="true">/</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          {eyebrow ? (
            <p className="mb-5 font-dm-mono text-[0.72rem] uppercase tracking-[0.18em] text-rose-700">
              {eyebrow}
            </p>
          ) : null}

          <h1
            id="service-detail-hero-heading"
            className="font-cormorant text-display-2 font-medium leading-[0.98] text-balance"
          >
            {renderHeadline(headline, italicWord)}
          </h1>
          <p className="mt-7 max-w-2xl font-inter text-lg leading-8 text-text-secondary md:text-xl">
            {sub}
          </p>

          {badges?.length ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <CheckChip key={badge} checked>
                  {badge}
                </CheckChip>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <GlowCtaButton href={primaryCta.href} variant="primary">
              {primaryCta.label}
            </GlowCtaButton>
            {secondaryCta ? (
              <GlowCtaButton href={secondaryCta.href} variant="ghost">
                {secondaryCta.label}
              </GlowCtaButton>
            ) : null}
          </div>

          {quickFacts?.length ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {quickFacts.map((fact) => (
                <Badge
                  key={`${fact.label}-${fact.value}`}
                  variant="outline"
                  className="h-auto rounded-full border-line bg-white/70 px-4 py-2 font-inter text-sm text-text-secondary shadow-subtle"
                >
                  <span className="font-medium text-text-primary">
                    {fact.label}
                  </span>
                  <span aria-hidden="true" className="text-rose-700">
                    ·
                  </span>
                  <span>{fact.value}</span>
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div
            aria-hidden="true"
            className="absolute -inset-8 rounded-full bg-rose-mesh opacity-80 blur-2xl"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lift">
            {heroImageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImageSrc}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <div
                data-needs-asset="service-hero"
                className="grid size-full place-items-center bg-neutral-100 px-6 text-center font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-tertiary"
              >
                Service hero
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailHero;
