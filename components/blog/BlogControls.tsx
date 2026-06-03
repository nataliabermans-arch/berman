"use client";

import CheckChip from "@/components/atoms/CheckChip";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface BlogControlsProps {
  categories: string[];
  onSearch: (q: string) => void;
  onCategoryToggle: (c: string) => void;
  activeCategories: Set<string>;
  query: string;
  className?: string;
}

/**
 * Sticky blog search and category filter controls.
 * Uses a horizontal scroll area for category chips on narrow screens.
 */
export function BlogControls({
  categories,
  onSearch,
  onCategoryToggle,
  activeCategories,
  query,
  className,
}: BlogControlsProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-30 border-b border-line bg-white/90 px-4 py-4 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center">
        <div className="md:w-80 lg:w-96">
          <Input
            type="search"
            value={query}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search journal"
            className="h-11 border-line bg-neutral-50 px-4 font-inter"
          />
        </div>
        <ScrollArea className="w-full md:flex-1">
          <div className="flex w-max gap-2 pb-1 md:w-full md:flex-wrap md:justify-end">
            {categories.map((category) => (
              <CheckChip
                key={category}
                checked={activeCategories.has(category)}
                onClick={() => onCategoryToggle(category)}
                className="shrink-0"
              >
                {category}
              </CheckChip>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default BlogControls;
