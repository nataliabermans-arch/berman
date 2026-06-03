import aliases from "./legacy-page-aliases.json";
import type { ServiceSlug } from "@/lib/services/content";

export type LegacyPageAliasType =
  | "biotype"
  | "blog"
  | "media"
  | "privacy"
  | "service"
  | "simple"
  | "sitemap"
  | "terms"
  | "thank-you";

export interface LegacyPageAlias {
  path: string;
  title: string;
  description: string;
  type: LegacyPageAliasType;
  serviceSlug?: ServiceSlug;
}

export const LEGACY_PAGE_ALIASES = aliases as LegacyPageAlias[];

export const LEGACY_EXACT_PAGE_PATHS = new Set(
  LEGACY_PAGE_ALIASES.map((alias) => alias.path),
);

export const LEGACY_SINGLE_SEGMENT_ALIASES = LEGACY_PAGE_ALIASES.filter(
  (alias) => {
    const slug = alias.path.replace(/^\/+|\/+$/g, "");
    return slug.length > 0 && !slug.includes("/");
  },
);

export const LEGACY_MEDIA_ALIASES = LEGACY_PAGE_ALIASES.filter((alias) =>
  alias.path.startsWith("/media/"),
);

export function normalizeLegacyPath(path: string) {
  if (path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}/`;
}

export function getLegacyPageAliasByPath(path: string) {
  const normalized = normalizeLegacyPath(path);
  return LEGACY_PAGE_ALIASES.find((alias) => alias.path === normalized) ?? null;
}

export function legacyAliasPathToSlug(alias: LegacyPageAlias) {
  return alias.path.replace(/^\/+|\/+$/g, "");
}
