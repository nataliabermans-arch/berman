"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface ExpectTimelineProps {
  eyebrow?: string;
  heading: string;
  phases: {
    phaseLabel: string;
    title: string;
    description: string;
    milestones?: string[];
  }[];
  className?: string;
}

/**
 * Horizontal treatment expectation timeline with phase cards and dividers.
 * Milestones render as compact rose bullets below each phase.
 */
export function ExpectTimeline({
  eyebrow,
  heading,
  phases,
  className,
}: ExpectTimelineProps) {
  return (
    <section
      aria-labelledby="expect-timeline-heading"
      className={cn(
        "bg-surface-soft px-container py-section text-text-primary",
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
            id="expect-timeline-heading"
            className="font-cormorant text-display-3 font-medium leading-tight"
          >
            {heading}
          </h2>
        </div>

        <Card className="mt-12 rounded-lg border border-line bg-white p-0 shadow-card lg:flex lg:gap-0">
          {phases.map((phase, index) => (
            <div
              key={`${phase.phaseLabel}-${phase.title}`}
              className="flex min-w-0 flex-1"
            >
              <article className="flex-1 p-6 lg:p-8">
                <p className="font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-rose-700">
                  {phase.phaseLabel}
                </p>
                <h3 className="mt-4 font-cormorant text-3xl font-medium leading-tight text-text-primary">
                  {phase.title}
                </h3>
                <p className="mt-3 font-inter text-sm leading-6 text-text-secondary">
                  {phase.description}
                </p>
                {phase.milestones?.length ? (
                  <ul className="mt-5 space-y-2">
                    {phase.milestones.map((milestone) => (
                      <li
                        key={milestone}
                        className="flex gap-2 font-inter text-sm leading-6 text-text-secondary"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-700"
                        />
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
              {index < phases.length - 1 ? (
                <>
                  <Separator className="bg-rose-50 lg:hidden" />
                  <Separator
                    orientation="vertical"
                    className="hidden bg-rose-50 lg:block"
                  />
                </>
              ) : null}
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}

export default ExpectTimeline;
