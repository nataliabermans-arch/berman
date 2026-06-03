"use client";

import { cn } from "@/lib/utils";

export interface TimelineProps {
  eyebrow?: string;
  heading: string;
  items: { year: string; title: string; description?: string }[];
  className?: string;
}

/**
 * Responsive career timeline with mobile vertical rhythm and large-screen zigzag.
 * Designed for year-led professional milestones.
 */
export function Timeline({
  eyebrow,
  heading,
  items,
  className,
}: TimelineProps) {
  return (
    <section
      aria-labelledby="timeline-heading"
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
            id="timeline-heading"
            className="font-cormorant text-display-3 font-medium leading-tight"
          >
            {heading}
          </h2>
        </div>

        <ol className="relative mx-auto mt-14 max-w-5xl space-y-10 lg:space-y-0">
          <span
            aria-hidden="true"
            className="absolute left-4 top-0 h-full w-px bg-rose-300 lg:left-1/2 lg:-translate-x-1/2"
          />
          {items.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <li
                key={`${item.year}-${item.title}`}
                className={cn(
                  "relative grid gap-5 pl-12 lg:grid-cols-[1fr_72px_1fr] lg:items-center lg:gap-8 lg:pl-0",
                  index > 0 && "lg:-mt-4",
                )}
              >
                <div
                  className={cn(
                    "rounded-lg border border-line bg-white p-6 shadow-subtle",
                    "lg:row-start-1",
                    isEven ? "lg:col-start-1 lg:text-right" : "lg:col-start-3",
                  )}
                >
                  <p className="font-dm-mono text-[0.7rem] uppercase tracking-[0.18em] text-rose-700">
                    {item.year}
                  </p>
                  <h3 className="mt-3 font-cormorant text-3xl font-medium leading-tight text-text-primary">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-3 font-inter text-sm leading-6 text-text-secondary">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <div className="absolute left-2.5 top-7 grid size-4 place-items-center rounded-full bg-rose-300 ring-8 ring-white lg:static lg:col-start-2 lg:row-start-1 lg:mx-auto">
                  <span className="size-2 rounded-full bg-rose-700" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default Timeline;
