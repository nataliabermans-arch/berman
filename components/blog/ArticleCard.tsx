"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ArticleCardProps {
  title: string;
  excerpt?: string;
  slug: string;
  category?: string;
  publishedAt?: string;
  readingTime?: string;
  heroImageSrc?: string;
  featured?: boolean;
  className?: string;
}

/**
 * Blog article card with compact and featured layouts.
 * Missing thumbnails render an asset placeholder for later content wiring.
 */
export function ArticleCard({
  title,
  excerpt,
  slug,
  category,
  publishedAt,
  readingTime,
  heroImageSrc,
  featured = false,
  className,
}: ArticleCardProps) {
  const href = `/${slug.replace(/^\/+/, "")}`;
  const meta = [readingTime, publishedAt].filter(Boolean).join(" · ");

  const image = (
    <div
      className={cn(
        "overflow-hidden bg-neutral-100",
        featured ? "aspect-[16/10] w-full" : "aspect-[4/3] w-full sm:w-44",
      )}
    >
      {heroImageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImageSrc}
          alt=""
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      ) : (
        <div
          data-needs-asset="blog-thumbnail"
          className="grid size-full place-items-center bg-neutral-100 font-dm-mono text-[0.62rem] uppercase tracking-[0.18em] text-text-tertiary"
        >
          Journal image
        </div>
      )}
    </div>
  );

  return (
    <a
      href={href}
      className={cn("group block focus-visible:outline-none", className)}
    >
      <Card
        className={cn(
          "h-full rounded-lg border border-line bg-white p-0 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lift group-focus-visible:ring-4 group-focus-visible:ring-rose-500/20",
          featured ? "gap-0" : "gap-0 sm:flex-row",
        )}
      >
        {image}
        <div className={cn("flex flex-1 flex-col p-5", featured && "p-6")}>
          {category ? (
            <Badge className="mb-4 rounded-full border-line-rose bg-rose-50 px-3 py-1 font-dm-mono text-[0.62rem] uppercase tracking-[0.16em] text-rose-700">
              {category}
            </Badge>
          ) : null}
          <h3
            className={cn(
              "font-cormorant font-medium leading-tight text-text-primary",
              featured ? "text-4xl" : "text-2xl",
            )}
          >
            {title}
          </h3>
          {excerpt ? (
            <p
              className={cn(
                "mt-3 font-inter text-sm leading-6 text-text-secondary",
                featured ? "line-clamp-3" : "line-clamp-2",
              )}
            >
              {excerpt}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-auto pt-5 font-dm-mono text-[0.65rem] uppercase tracking-[0.18em] text-text-tertiary">
              {meta}
            </p>
          ) : null}
        </div>
      </Card>
    </a>
  );
}

export default ArticleCard;
