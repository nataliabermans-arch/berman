"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface AboutBioEssayProps {
  sections: { heading?: string; paragraphs: string[] }[];
  pullQuote?: { quote: string; attribution?: string };
  portraitSrc?: string;
  className?: string;
}

/**
 * Long-form biography essay with optional portrait and editorial pull quote.
 * Uses generous Cormorant body rhythm for a quieter reading experience.
 */
export function AboutBioEssay({
  sections,
  pullQuote,
  portraitSrc,
  className,
}: AboutBioEssayProps) {
  const quoteIndex = pullQuote
    ? Math.max(1, Math.ceil(sections.length / 2))
    : -1;

  return (
    <section
      aria-labelledby="about-bio-heading"
      className={cn(
        "bg-white px-container py-section text-text-primary",
        className,
      )}
    >
      <div className="mx-auto grid max-w-content gap-12 lg:grid-cols-[minmax(220px,320px)_minmax(0,1fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-lg border border-line bg-neutral-50 shadow-subtle">
            <div className="aspect-[4/5] bg-rose-soft">
              {portraitSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={portraitSrc}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div
                  data-needs-asset="dr-portrait"
                  className="grid size-full place-items-center px-6 text-center font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-tertiary"
                >
                  Dr. portrait
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="mx-auto w-full max-w-prose">
          {sections.map((section, index) => (
            <div key={`${section.heading ?? "bio"}-${index}`}>
              {index === 0 ? (
                <h2 id="about-bio-heading" className="sr-only">
                  Biography
                </h2>
              ) : null}

              {section.heading ? (
                <h3 className="mb-7 font-cormorant text-4xl font-medium leading-tight text-text-primary">
                  {section.heading}
                </h3>
              ) : null}

              <div className="space-y-7">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={`${paragraph.slice(0, 24)}-${paragraphIndex}`}
                    className="font-cormorant text-2xl font-normal leading-[1.55] text-text-primary md:text-[1.7rem]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {index + 1 === quoteIndex && pullQuote ? (
                <blockquote className="my-12 border-l-4 border-rose-700 pl-7">
                  <p className="font-cormorant text-4xl font-normal italic leading-tight text-text-primary md:text-5xl">
                    {pullQuote.quote}
                  </p>
                  {pullQuote.attribution ? (
                    <footer className="mt-5 font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-rose-700">
                      {pullQuote.attribution}
                    </footer>
                  ) : null}
                </blockquote>
              ) : null}

              {index < sections.length - 1 ? (
                <Separator className="my-12 bg-rose-50" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutBioEssay;
