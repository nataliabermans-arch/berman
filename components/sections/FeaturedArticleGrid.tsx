"use client";

import ArticleCard from "@/components/blog/ArticleCard";
import { cn } from "@/lib/utils";

export interface FeaturedArticleGridProps {
  eyebrow?: string;
  heading: string;
  articles: {
    title: string;
    excerpt?: string;
    slug: string;
    category?: string;
    publishedAt?: string;
    readingTime?: string;
    heroImageSrc?: string;
  }[];
  className?: string;
}

/**
 * Blog bento grid with one featured article and compact supporting cards.
 * Designed for blog index and homepage editorial sections.
 */
export function FeaturedArticleGrid({
  eyebrow,
  heading,
  articles,
  className,
}: FeaturedArticleGridProps) {
  const [featured, ...rest] = articles;

  return (
    <section
      aria-labelledby="featured-article-grid-heading"
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
            id="featured-article-grid-heading"
            className="font-cormorant text-display-3 font-medium italic leading-tight"
          >
            {heading}
          </h2>
        </div>

        {featured ? (
          <div className="mt-12 grid gap-6">
            <ArticleCard {...featured} featured className="w-full" />
            {rest.length ? (
              <div className="grid gap-6 lg:grid-cols-3">
                {rest.slice(0, 3).map((article) => (
                  <ArticleCard
                    key={`${article.slug}-${article.title}`}
                    {...article}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-12 rounded-lg border border-dashed border-line bg-neutral-50 p-10 text-center font-inter text-sm text-text-tertiary">
            No featured articles available.
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedArticleGrid;
