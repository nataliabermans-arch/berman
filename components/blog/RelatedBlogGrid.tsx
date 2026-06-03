"use client";

import ArticleCard, {
  type ArticleCardProps,
} from "@/components/blog/ArticleCard";
import { cn } from "@/lib/utils";

export interface RelatedBlogGridProps {
  articles: ArticleCardProps[];
  heading?: string;
  columns?: 2 | 3;
  className?: string;
}

/**
 * Responsive related-article grid composed from ArticleCard entries.
 * Supports two- or three-column desktop layouts with an optional heading.
 */
export function RelatedBlogGrid({
  articles,
  heading = "You may also like",
  columns = 3,
  className,
}: RelatedBlogGridProps) {
  return (
    <section className={className}>
      {heading ? (
        <h2 className="mb-8 font-cormorant text-4xl font-normal italic leading-tight text-text-primary">
          {heading}
        </h2>
      ) : null}
      <div
        className={cn(
          "grid grid-cols-1 gap-6 md:grid-cols-2",
          columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2",
        )}
      >
        {articles.map((article) => (
          <ArticleCard key={article.slug} {...article} />
        ))}
      </div>
    </section>
  );
}

export default RelatedBlogGrid;
