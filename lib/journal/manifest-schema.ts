/**
 * Manifest schema for migrated WP blog posts.
 * Built by the migration agent. Read by the listing page, sitemap, and redirects.
 */

export interface MigratedPostFrontmatter {
  slug: string;
  title: string;
  italicWord: string; // best-effort italic candidate from title
  excerpt: string;
  category: string; // canonical category from CATEGORIES list, or "Uncategorized"
  publishedAt: string; // ISO date
  updatedAt?: string; // ISO date
  readTime: number; // minutes
  wordCount: number;
  featuredImage?: string; // image asset path or external URL; not the article URL
  originalUrl: string; // https://bermansexualhealth.com/<slug>/
  tags?: string[];
  author?: string;
}

export interface JournalManifest {
  generatedAt: string; // ISO
  totalPosts: number;
  posts: MigratedPostFrontmatter[];
}

export const CANONICAL_CATEGORIES = [
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

export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number];
