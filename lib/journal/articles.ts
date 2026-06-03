import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { MigratedPostFrontmatter } from "./manifest-schema";
import {
  PAGE_SIZE,
  type JournalArticle,
  type JournalArticleSummary,
} from "./types";

export type {
  JournalArticle,
  JournalArticleSummary,
  JournalCategory,
} from "./types";
export { PAGE_SIZE, JOURNAL_CATEGORIES } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "journal");

let _cache: JournalArticle[] | null = null;

const REDIRECT_ONLY_MIGRATED_SLUGS = new Set<string>();

export function isRedirectOnlyMigratedSlug(slug: string) {
  return REDIRECT_ONLY_MIGRATED_SLUGS.has(slug);
}

function rewriteLegacyUploadUrls(value?: string) {
  if (!value) return value;

  return value
    .replace(
      /https?:\/\/(?:www\.)?bermansexualhealth\.com\/wp-content\/uploads\//g,
      "/legacy-assets/uploads/",
    )
    .replace(
      /(^|[\s("'=])\/wp-content\/uploads\//g,
      "$1/legacy-assets/uploads/",
    );
}

function loadAll(): JournalArticle[] {
  if (_cache) return _cache;
  if (!fs.existsSync(CONTENT_DIR)) {
    _cache = [];
    return _cache;
  }
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const articles: JournalArticle[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const parsed = matter(raw);
    const frontmatter = parsed.data as MigratedPostFrontmatter;
    if (isRedirectOnlyMigratedSlug(frontmatter.slug)) {
      continue;
    }
    articles.push({
      ...frontmatter,
      featuredImage: rewriteLegacyUploadUrls(frontmatter.featuredImage),
      body: rewriteLegacyUploadUrls(parsed.content) ?? parsed.content,
    });
  }
  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  _cache = articles;
  return articles;
}

export function getAllArticles(): JournalArticle[] {
  return loadAll();
}

export function getArticleBySlug(slug: string): JournalArticle | null {
  return loadAll().find((a) => a.slug === slug) ?? null;
}

export function getAllSlugs(): string[] {
  return loadAll().map((a) => a.slug);
}

export function getArticlesByPage(page: number): {
  articles: JournalArticle[];
  totalPages: number;
  total: number;
} {
  const all = loadAll();
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  return { articles: all.slice(start, start + PAGE_SIZE), totalPages, total };
}

export function getAllArticleSummaries(): JournalArticleSummary[] {
  return loadAll().map((a) => ({
    slug: a.slug,
    title: a.title,
    italicWord: a.italicWord,
    excerpt: a.excerpt,
    category: a.category,
    publishedAt: a.publishedAt,
    readTime: a.readTime,
    featuredImage: a.featuredImage,
  }));
}

export const JOURNAL_ARTICLES: JournalArticle[] = loadAll();
