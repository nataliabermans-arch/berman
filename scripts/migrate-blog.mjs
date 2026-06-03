#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import TurndownService from "turndown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const API_BASE = "https://bermansexualhealth.com/wp-json/wp/v2";
const OUT_DIR = join(ROOT, "content/journal");
const MANIFEST_PATH = join(ROOT, "lib/journal/manifest.json");
const PER_PAGE = 100;
const PAGE_DELAY_MS = 200;

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(dirname(MANIFEST_PATH), { recursive: true });

// ---------- Category mapping ----------
const CANONICAL = {
  MENO: "Menopause & Hormones",
  SEX: "Sexual Health",
  PELVIC: "Pelvic & Urinary",
  VAG: "Vaginal Rejuvenation",
  AESTH: "Aesthetic & Regenerative",
  BODY: "Body Contouring",
  PRESS: "Press",
  BOOKS: "Books",
  UNCAT: "Uncategorized",
};

function classifyCategoryName(name) {
  const n = (name || "").toLowerCase();
  if (/menopaus|hormone|perimenopaus|hrt/.test(n)) return CANONICAL.MENO;
  if (/sex(ual)?\b|libido|intimacy|arousal|orgasm|sexual pain|pain\b/.test(n))
    return CANONICAL.SEX;
  if (/pelvic|urin|incontinen|urology|poise/.test(n)) return CANONICAL.PELVIC;
  if (/vagin|rejuvenat|thermiva/.test(n)) return CANONICAL.VAG;
  if (/aesthet|skin|hair|filler|botox|anti.aging|beautifull/.test(n))
    return CANONICAL.AESTH;
  if (/weight|body|contour|emsculpt/.test(n)) return CANONICAL.BODY;
  if (/press|media|interview|guests|transcripts|sex talks|news/.test(n))
    return CANONICAL.PRESS;
  if (/book|for women only/.test(n)) return CANONICAL.BOOKS;
  return null;
}

// ---------- Helpers ----------
function decodeHtml(s) {
  if (!s) return "";
  return String(s)
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "…")
    .replace(/&#8242;/g, "′")
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    );
}

function stripHtml(s) {
  return decodeHtml(String(s || "").replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "from",
  "and",
  "or",
  "but",
  "your",
  "you",
  "it",
  "is",
  "as",
  "be",
  "are",
  "was",
  "were",
  "that",
  "this",
  "these",
  "those",
  "i",
  "we",
  "they",
  "my",
  "our",
  "their",
  "its",
  "s",
  "t",
  "do",
  "did",
  "does",
]);

function pickItalicWord(rawTitle) {
  const title = stripHtml(rawTitle);
  if (!title) return "";
  // Tokenize on whitespace, keep words intact, strip trailing punctuation per token
  const tokens = title
    .split(/\s+/)
    .map((t) =>
      t.replace(/[^\p{L}\p{N}\-]+$/u, "").replace(/^[^\p{L}\p{N}\-]+/u, ""),
    );
  const cleaned = tokens.filter(Boolean);
  if (cleaned.length === 0) return "";
  // Walk from the right; pick first non-stop word
  for (let i = cleaned.length - 1; i >= 0; i--) {
    const w = cleaned[i];
    if (!STOP_WORDS.has(w.toLowerCase())) {
      // verify it appears verbatim in title
      if (title.includes(w)) return w;
    }
  }
  // Fallback: last 2 words joined
  const last2 = cleaned.slice(-2).join(" ");
  return last2 || cleaned[cleaned.length - 1];
}

async function fetchJson(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "berman-migration/1.0" },
    });
    if (res.status >= 500 || res.status === 429) {
      if (attempt < 1) {
        await new Promise((r) => setTimeout(r, 2000));
        return fetchJson(url, attempt + 1);
      }
      throw new Error(`HTTP ${res.status} on ${url}`);
    }
    if (res.status >= 400) {
      throw new Error(`HTTP ${res.status} on ${url}`);
    }
    return await res.json();
  } catch (err) {
    if (attempt < 1) {
      await new Promise((r) => setTimeout(r, 2000));
      return fetchJson(url, attempt + 1);
    }
    throw err;
  }
}

// ---------- Turndown ----------
const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
});

turndown.addRule("removeShortcodes", {
  filter: (node) => node.nodeName === "SCRIPT" || node.nodeName === "STYLE",
  replacement: () => "",
});

turndown.addRule("figure", {
  filter: "figure",
  replacement: (content, node) => {
    const img = node.querySelector ? node.querySelector("img") : null;
    if (!img) return content;
    const src = img.getAttribute("src") || "";
    const alt = img.getAttribute("alt") || "";
    return `\n\n![${alt}](${src})\n\n`;
  },
});

function htmlToMarkdown(html) {
  if (!html) return "";
  // strip wp gutenberg comments
  const cleaned = String(html).replace(/<!--\s*\/?wp:[^>]*-->/g, "");
  return turndown.turndown(cleaned).trim();
}

// ---------- Main ----------
async function main() {
  console.log(`[migrate-blog] OUT_DIR=${OUT_DIR}`);
  console.log(`[migrate-blog] MANIFEST=${MANIFEST_PATH}`);

  // 1. Build category map
  console.log("[migrate-blog] Fetching categories...");
  const categories = await fetchJson(
    `${API_BASE}/categories?per_page=100&_fields=id,name,slug`,
  );
  const catMap = new Map();
  for (const c of categories) {
    const canon = classifyCategoryName(c.name) || classifyCategoryName(c.slug);
    catMap.set(c.id, canon || CANONICAL.UNCAT);
  }
  console.log(`[migrate-blog] Mapped ${categories.length} categories.`);

  // 2. Determine total pages
  const headRes = await fetch(`${API_BASE}/posts?per_page=${PER_PAGE}&page=1`, {
    method: "HEAD",
    headers: { "User-Agent": "berman-migration/1.0" },
  });
  const totalPages = Number(headRes.headers.get("x-wp-totalpages") || "0") || 5;
  const totalReported = Number(headRes.headers.get("x-wp-total") || "0");
  console.log(
    `[migrate-blog] WP reports ${totalReported} posts across ${totalPages} pages.`,
  );

  // 3. Fetch all posts page by page
  const written = [];
  let skipped = 0;
  let consecFailures = 0;
  const categoryCounts = {};

  for (let page = 1; page <= totalPages; page++) {
    const url = `${API_BASE}/posts?per_page=${PER_PAGE}&page=${page}&_embed=1`;
    console.log(`[migrate-blog] Fetching page ${page}/${totalPages}...`);
    let posts;
    try {
      posts = await fetchJson(url);
    } catch (err) {
      console.error(
        `[migrate-blog] Page ${page} fetch failed: ${err.message}. Skipping page.`,
      );
      consecFailures++;
      if (consecFailures >= 3) {
        console.error(`[migrate-blog] ABORT: 3+ consecutive page failures.`);
        break;
      }
      continue;
    }
    consecFailures = 0;
    console.log(`[migrate-blog] Page ${page}: ${posts.length} posts.`);

    for (const post of posts) {
      try {
        const slug = post.slug;
        const rawTitle = post?.title?.rendered || "";
        const rawBody = post?.content?.rendered || "";
        if (!slug) {
          skipped++;
          console.warn(`[migrate-blog] SKIP (no slug): id=${post.id}`);
          continue;
        }
        const body = htmlToMarkdown(rawBody);
        if (!body || body.length < 20) {
          skipped++;
          console.warn(`[migrate-blog] SKIP (empty body): ${slug}`);
          continue;
        }

        const title = stripHtml(rawTitle);
        const excerpt = stripHtml(post?.excerpt?.rendered || "")
          .slice(0, 280)
          .trim();
        const publishedAt = post.date_gmt
          ? `${post.date_gmt}Z`
          : new Date().toISOString();
        const updatedAt = post.modified_gmt
          ? `${post.modified_gmt}Z`
          : undefined;

        // Category from first id present in catMap
        let category = CANONICAL.UNCAT;
        if (Array.isArray(post.categories)) {
          for (const cid of post.categories) {
            const c = catMap.get(cid);
            if (c && c !== CANONICAL.UNCAT) {
              category = c;
              break;
            }
            if (c) category = c;
          }
        }

        const featured =
          post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

        // Tags from embedded wp:term (terms are nested arrays, find taxonomy=post_tag)
        let tags;
        const termGroups = post?._embedded?.["wp:term"] || [];
        for (const grp of termGroups) {
          if (
            Array.isArray(grp) &&
            grp.length &&
            grp[0]?.taxonomy === "post_tag"
          ) {
            tags = grp.map((t) => t.slug).filter(Boolean);
            break;
          }
        }

        const author =
          post?._embedded?.author?.[0]?.name || "Dr. Jennifer Berman, MD";
        const wordCount = body.split(/\s+/).filter(Boolean).length;
        const readTime = Math.max(2, Math.round(wordCount / 230));
        const italicWord = pickItalicWord(title);
        const originalUrl =
          post.link || `https://bermansexualhealth.com/${slug}/`;

        const fm = {
          slug,
          title,
          italicWord,
          excerpt,
          category,
          publishedAt,
          ...(updatedAt ? { updatedAt } : {}),
          readTime,
          wordCount,
          ...(featured ? { featuredImage: featured } : {}),
          originalUrl,
          ...(tags && tags.length ? { tags } : {}),
          author,
        };

        const fileContent = matter.stringify(body + "\n", fm);
        const outPath = join(OUT_DIR, `${slug}.md`);
        writeFileSync(outPath, fileContent, "utf8");
        written.push(fm);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      } catch (err) {
        skipped++;
        console.error(
          `[migrate-blog] SKIP (error) id=${post?.id} slug=${post?.slug}: ${err.message}`,
        );
      }
    }

    if (page < totalPages) {
      await new Promise((r) => setTimeout(r, PAGE_DELAY_MS));
    }
  }

  // 4. Manifest
  written.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalPosts: written.length,
    posts: written,
  };
  writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8",
  );

  // 5. Report
  const fileCount = readdirSync(OUT_DIR).filter((f) =>
    f.endsWith(".md"),
  ).length;
  console.log("");
  console.log(`[migrate-blog] DONE.`);
  console.log(
    `[migrate-blog] Wrote ${written.length} posts; skipped ${skipped}.`,
  );
  console.log(`[migrate-blog] Files in ${OUT_DIR}: ${fileCount}`);
  console.log(`[migrate-blog] Categories:`);
  for (const [k, v] of Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1],
  )) {
    console.log(`  ${v.toString().padStart(4, " ")}  ${k}`);
  }
  console.log(`[migrate-blog] Manifest: ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(`[migrate-blog] FATAL: ${err.stack || err.message}`);
  process.exit(1);
});
