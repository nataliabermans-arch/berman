"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ProcessStepsProps {
  eyebrow?: string;
  heading: string;
  steps: {
    number: string;
    title: string;
    description: string;
    durationLabel?: string;
  }[];
  className?: string;
}

/**
 * Numbered treatment process flow with large ghost numerals.
 * Stacks on mobile and connects horizontally on large screens.
 */
export function ProcessSteps({
  eyebrow,
  heading,
  steps,
  className,
}: ProcessStepsProps) {
  return (
    <section
      aria-labelledby="process-steps-heading"
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
            id="process-steps-heading"
            className="font-cormorant text-display-3 font-medium leading-tight"
          >
            {heading}
          </h2>
        </div>

        <ol className="mt-12 grid gap-5 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={`${step.number}-${step.title}`} className="relative">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[calc(100%-0.75rem)] top-16 z-10 hidden h-px w-6 bg-rose-300 lg:block"
                />
              ) : null}
              <Card className="relative h-full rounded-lg border border-line bg-white p-6 shadow-card">
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-5 font-cormorant text-[8rem] font-medium leading-none text-rose-300/35"
                >
                  {step.number}
                </span>
                <div className="relative z-10 pt-16">
                  {step.durationLabel ? (
                    <p className="mb-4 font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-rose-700">
                      {step.durationLabel}
                    </p>
                  ) : null}
                  <h3 className="font-cormorant text-3xl font-medium leading-tight text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-4 font-inter text-sm leading-6 text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default ProcessSteps;
