import { cn } from "@/lib/utils";

export interface StandardHeroProps {
  eyebrow?: string;
  headline: string;
  italicWord?: string;
  sub?: string;
  breadcrumbs?: { label: string; href?: string }[];
  variant?: "blush" | "ink";
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
 * Smaller editorial page hero for interior pages.
 * Supports optional breadcrumbs, eyebrow copy, and one italic emphasized word.
 */
export function StandardHero({
  eyebrow,
  headline,
  italicWord,
  sub,
  breadcrumbs,
  variant = "blush",
  className,
}: StandardHeroProps) {
  const isInk = variant === "ink";

  return (
    <section
      aria-labelledby="standard-hero-heading"
      className={cn(
        "relative isolate overflow-hidden px-container py-section",
        "lg:flex lg:min-h-[50vh] lg:items-center",
        isInk
          ? "bg-ink-aurora text-text-inverse"
          : "bg-rose-soft text-text-primary",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-content">
        <div className="max-w-4xl">
          {breadcrumbs?.length ? (
            <nav
              aria-label="Breadcrumb"
              className={cn(
                "mb-8 font-dm-mono text-[0.68rem] uppercase tracking-[0.18em]",
                isInk ? "text-white/60" : "text-text-tertiary",
              )}
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
                        className={cn(
                          "transition-colors hover:text-rose-700",
                          isInk && "hover:text-rose-100",
                        )}
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
            <p
              className={cn(
                "mb-5 font-dm-mono text-[0.72rem] uppercase tracking-[0.18em]",
                isInk ? "text-rose-100" : "text-rose-700",
              )}
            >
              {eyebrow}
            </p>
          ) : null}

          <h1
            id="standard-hero-heading"
            className="max-w-5xl font-cormorant text-display-2 font-medium leading-[0.98] text-balance"
          >
            {renderHeadline(headline, italicWord)}
          </h1>

          {sub ? (
            <p
              className={cn(
                "mt-8 max-w-2xl font-inter text-lg leading-8 md:text-xl",
                isInk ? "text-white/75" : "text-text-secondary",
              )}
            >
              {sub}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default StandardHero;
