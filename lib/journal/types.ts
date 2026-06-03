import type { MigratedPostFrontmatter } from "./manifest-schema";

export interface JournalArticle extends MigratedPostFrontmatter {
  body: string;
}

export type JournalArticleSummary = Pick<
  JournalArticle,
  | "slug"
  | "title"
  | "italicWord"
  | "excerpt"
  | "category"
  | "publishedAt"
  | "readTime"
  | "featuredImage"
>;

export const PAGE_SIZE = 12;

export const JOURNAL_CATEGORIES = [
  "All",
  "Menopause & Hormones",
  "Sexual Health",
  "Pelvic & Urinary",
  "Vaginal Rejuvenation",
  "Aesthetic & Regenerative",
  "Body Contouring",
  "Press",
  "Books",
  "Uncategorized",
] as const;

export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];
