import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";
import { SUPPLEMENTS, SUPPLEMENT_BUNDLE } from "@/lib/services/supplements";
import {
  isRedirectOnlyMigratedSlug,
  JOURNAL_ARTICLES,
} from "@/lib/journal/articles";

interface JournalSitemapEntry {
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  originalUrl?: string;
}

const LEGACY_SERVICE_URLS = [
  "/aesthetic-treatments/",
  "/sexual-urinary-tract-health/",
  "/emsella-treatment-for-incontinence/",
  "/menopause-perimenopause/",
  "/vaginal-rejuvenation-expert/",
  "/body-contouring/",
];

function loadJournalEntries(): JournalSitemapEntry[] {
  const localEntries = JOURNAL_ARTICLES.map((a) => ({
    slug: a.slug,
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt,
    originalUrl: a.originalUrl,
  }));
  const manifestPath = path.join(
    process.cwd(),
    "lib",
    "journal",
    "manifest.json",
  );
  if (fs.existsSync(manifestPath)) {
    try {
      const raw = fs.readFileSync(manifestPath, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.posts) && parsed.posts.length > 0) {
        const entries: JournalSitemapEntry[] = parsed.posts
          .filter(
            (p: unknown): p is JournalSitemapEntry =>
              typeof p === "object" &&
              p !== null &&
              typeof (p as JournalSitemapEntry).slug === "string" &&
              !isRedirectOnlyMigratedSlug((p as JournalSitemapEntry).slug),
          )
          .map((p: JournalSitemapEntry) => ({
            slug: p.slug,
            publishedAt: p.publishedAt ?? new Date().toISOString(),
            updatedAt: p.updatedAt,
            originalUrl: p.originalUrl,
          }));
        const seen = new Set(entries.map((entry) => entry.slug));
        return [
          ...entries,
          ...localEntries.filter((entry) => !seen.has(entry.slug)),
        ];
      }
    } catch {
      // fall through to static fallback
    }
  }
  return localEntries;
}

function canonicalUrl(pathOrUrl: string): string {
  const value = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;

  if (value.includes("?") || value.endsWith("/")) {
    return value;
  }

  return `${value}/`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const supplementSlugs = [
    SUPPLEMENT_BUNDLE.slug,
    ...SUPPLEMENTS.map((s) => s.slug),
  ];
  const journalEntries = loadJournalEntries();

  return [
    {
      url: canonicalUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: canonicalUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: canonicalUrl("/services"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: canonicalUrl("/biotype"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: canonicalUrl("/books"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: canonicalUrl("/stories"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...LEGACY_SERVICE_URLS.map((url) => ({
      url: canonicalUrl(url),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: canonicalUrl("/services/supplements/"),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...supplementSlugs.map((slug) => ({
      url: canonicalUrl(`/services/supplements/${slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    {
      url: canonicalUrl("/womens-health-blog"),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...journalEntries.map((a) => ({
      url: canonicalUrl(a.originalUrl || `/${a.slug}`),
      lastModified: new Date(a.updatedAt ?? a.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: canonicalUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: canonicalUrl("/privacy-policy/"),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: canonicalUrl("/terms-of-use/"),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: canonicalUrl("/accessibility"),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];
}
