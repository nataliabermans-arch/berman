/**
 * Internal-linking graph for the article library.
 *
 * Background: the articles were migrated with their in-body cross-links
 * stripped out, so the only thing connecting them was a "related" strip that
 * naively took the first three articles of the same category. That left the
 * long tail of the library orphaned — hundreds of pages in the sitemap with
 * nothing linking to them, so readers (and crawlers) landed on one article and
 * had nowhere relevant to go next.
 *
 * This module rebuilds a proper related-articles graph. Each article gets a
 * ranked set of genuinely related articles (shared category, tags, and
 * title/excerpt keywords), and a coverage pass guarantees every article is
 * linked to from at least MIN_INBOUND other articles — no orphans. The graph
 * is computed once and memoised.
 */

import { getAllArticles } from "./articles";
import type { JournalArticle } from "./types";

const DISPLAY_LIMIT = 6; // related links surfaced on a page by default
const MAX_OUTBOUND = 8; // hard cap so coverage repair can't bloat a page
const MIN_INBOUND = 2; // every article must be linked to at least this often

// Words that carry no topical signal for this library.
const STOPWORDS = new Set([
  "the", "and", "for", "with", "your", "you", "our", "are", "was", "were",
  "this", "that", "these", "those", "from", "into", "about", "what", "when",
  "why", "how", "who", "will", "can", "does", "did", "has", "have", "had",
  "not", "but", "all", "any", "her", "his", "she", "they", "them", "their",
  "its", "out", "get", "got", "one", "two", "new", "now", "more", "most",
  "than", "then", "some", "such", "may", "might", "also", "just", "like",
  "over", "after", "before", "between", "women", "womens", "woman", "health",
  "dr", "berman", "jennifer", "guide", "everything", "know", "need", "things",
  "tips", "best", "top", "ways",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

interface Indexed {
  article: JournalArticle;
  words: Set<string>;
  tags: Set<string>;
  time: number;
}

let GRAPH: Map<string, JournalArticle[]> | null = null;

function buildGraph(): Map<string, JournalArticle[]> {
  const articles = getAllArticles();

  // Index each article's topical signals.
  const df = new Map<string, number>(); // document frequency per keyword
  const indexed: Indexed[] = articles.map((article) => {
    const words = new Set(tokenize(`${article.title} ${article.excerpt ?? ""}`));
    for (const w of words) df.set(w, (df.get(w) ?? 0) + 1);
    return {
      article,
      words,
      tags: new Set((article.tags ?? []).map((t) => t.toLowerCase())),
      time: Date.parse(article.publishedAt ?? "") || 0,
    };
  });

  const total = indexed.length;
  const bySlug = new Map(indexed.map((x) => [x.article.slug, x]));

  // Rarer shared keywords are worth more (idf-lite).
  const idf = (w: string) => Math.log(1 + total / (1 + (df.get(w) ?? 0)));

  function score(a: Indexed, b: Indexed): number {
    let s = 0;
    // Same real category is a strong topical signal; "Uncategorized" is not.
    if (
      a.article.category === b.article.category &&
      a.article.category &&
      a.article.category !== "Uncategorized"
    ) {
      s += 2.5;
    }
    for (const t of a.tags) if (b.tags.has(t)) s += 1.5;
    // Iterate the smaller word set for the keyword overlap.
    const [small, big] = a.words.size <= b.words.size ? [a.words, b.words] : [b.words, a.words];
    for (const w of small) if (big.has(w)) s += idf(w);
    return s;
  }

  // Deterministic ordering so the graph is stable across builds.
  const order = (x: Indexed, y: Indexed, sx: number, sy: number) =>
    sy - sx || y.time - x.time || (x.article.slug < y.article.slug ? -1 : 1);

  // Phase 1 — relevance: each article picks its top matches.
  const related = new Map<string, string[]>();
  const inbound = new Map<string, number>();
  for (const x of indexed) inbound.set(x.article.slug, 0);

  for (const a of indexed) {
    const scored = indexed
      .filter((b) => b.article.slug !== a.article.slug)
      .map((b) => ({ b, s: score(a, b) }))
      .sort((p, q) => order(p.b, q.b, p.s, q.s))
      .slice(0, DISPLAY_LIMIT);
    const picks = scored.map((p) => p.b.article.slug);
    related.set(a.article.slug, picks);
    for (const slug of picks) inbound.set(slug, (inbound.get(slug) ?? 0) + 1);
  }

  // Phase 2 — coverage repair: adopt every under-linked article into the
  // related list of its most similar neighbour that still has capacity.
  const underlinked = indexed
    .filter((x) => (inbound.get(x.article.slug) ?? 0) < MIN_INBOUND)
    .sort(
      (x, y) =>
        (inbound.get(x.article.slug) ?? 0) - (inbound.get(y.article.slug) ?? 0) ||
        x.time - y.time,
    );

  for (const target of underlinked) {
    const candidates = indexed
      .filter((a) => {
        if (a.article.slug === target.article.slug) return false;
        if ((related.get(a.article.slug) ?? []).includes(target.article.slug)) return false;
        return (related.get(a.article.slug) ?? []).length < MAX_OUTBOUND;
      })
      .map((a) => ({ a, s: score(a, target) }))
      .sort((p, q) => order(p.a, q.a, p.s, q.s));

    for (const { a } of candidates) {
      if ((inbound.get(target.article.slug) ?? 0) >= MIN_INBOUND) break;
      related.get(a.article.slug)!.push(target.article.slug);
      inbound.set(
        target.article.slug,
        (inbound.get(target.article.slug) ?? 0) + 1,
      );
    }
  }

  // Materialise slugs back into full articles.
  const graph = new Map<string, JournalArticle[]>();
  for (const [slug, slugs] of related) {
    graph.set(
      slug,
      slugs
        .map((s) => bySlug.get(s)?.article)
        .filter((a): a is JournalArticle => Boolean(a)),
    );
  }
  return graph;
}

/**
 * Related articles for a slug, ranked by relevance. Every article in the
 * library is guaranteed to appear in at least MIN_INBOUND of these lists, so
 * there are no orphaned pages.
 */
export function getRelatedArticles(
  slug: string,
  limit: number = DISPLAY_LIMIT,
): JournalArticle[] {
  if (!GRAPH) GRAPH = buildGraph();
  return (GRAPH.get(slug) ?? []).slice(0, limit);
}
