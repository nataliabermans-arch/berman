"use client";

import ServiceCard from "@/components/composites/ServiceCard";
import { cn } from "@/lib/utils";

export interface ServiceGridProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  services: {
    title: string;
    blurb: string;
    badge?: string;
    imageSrc?: string;
    href: string;
  }[];
  columns?: 2 | 3;
  className?: string;
}

/**
 * Responsive treatment card grid composed from shared ServiceCard composites.
 * Supports two or three large-screen columns.
 */
export function ServiceGrid({
  eyebrow,
  heading,
  intro,
  services,
  columns = 3,
  className,
}: ServiceGridProps) {
  return (
    <section
      aria-labelledby="service-grid-heading"
      className={cn(
        "bg-white px-container py-section text-text-primary",
        className,
      )}
    >
      <div className="mx-auto max-w-content">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow ? (
            <p className="mb-4 font-dm-mono text-[0.72rem] uppercase tracking-[0.18em] text-rose-700">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id="service-grid-heading"
            className="font-cormorant text-display-3 font-medium leading-tight"
          >
            {heading}
          </h2>
          {intro ? (
            <p className="mt-5 font-inter text-base leading-7 text-text-secondary md:text-lg">
              {intro}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-12 grid gap-6 md:grid-cols-2",
            columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3",
          )}
        >
          {services.map((service) => (
            <ServiceCard
              key={`${service.title}-${service.href}`}
              {...service}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceGrid;
