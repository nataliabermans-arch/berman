import { execFileSync } from "node:child_process";
import https from "node:https";

const LEGACY_HOST = "bermansexualhealth.com";
const LEGACY_ORIGIN_IP = "50.62.141.127";
const LIVE_HOST = "bermansexualhealth.com";
const USER_AGENT = "berman-blog-migration-audit";
const CONCURRENCY = 18;

function curlLegacy(path, includeHeaders = false) {
  const args = [
    "-sS",
    "--resolve",
    `${LEGACY_HOST}:443:${LEGACY_ORIGIN_IP}`,
  ];
  if (includeHeaders) args.push("-D", "-");
  args.push(`https://${LEGACY_HOST}${path}`);
  return execFileSync("curl", args, {
    encoding: "utf8",
    maxBuffer: 80 * 1024 * 1024,
  });
}

function parseHeaders(raw) {
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .slice(1)
      .filter((line) => line.includes(":"))
      .map((line) => {
        const index = line.indexOf(":");
        return [line.slice(0, index).toLowerCase(), line.slice(index + 1).trim()];
      }),
  );
}

function fetchLegacyPosts() {
  const firstRaw = curlLegacy(
    "/wp-json/wp/v2/posts?per_page=100&page=1&_fields=id,slug,title,date,modified,link",
    true,
  );
  const [headerBlock, ...bodyParts] = firstRaw.split(/\r?\n\r?\n/);
  const headers = parseHeaders(headerBlock);
  const totalPages = Number(headers["x-wp-totalpages"]);
  const total = Number(headers["x-wp-total"]);
  let posts = JSON.parse(bodyParts.join("\n\n"));

  for (let page = 2; page <= totalPages; page += 1) {
    posts = posts.concat(
      JSON.parse(
        curlLegacy(
          `/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=id,slug,title,date,modified,link`,
        ),
      ),
    );
  }

  return { total, posts };
}

function requestLive(path, method = "GET") {
  return new Promise((resolve) => {
    const req = https.request(
      {
        method,
        hostname: LIVE_HOST,
        path,
        headers: { "user-agent": USER_AGENT },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          if (method !== "HEAD") body += chunk;
        });
        res.on("end", () => {
          resolve({
            path,
            status: res.statusCode,
            location: res.headers.location ?? null,
            body,
          });
        });
      },
    );
    req.on("error", (error) =>
      resolve({ path, status: 0, location: null, body: "", error: error.message }),
    );
    req.end();
  });
}

async function mapLimit(items, limit, worker) {
  const results = [];
  let index = 0;
  async function run() {
    for (;;) {
      const current = index;
      index += 1;
      if (current >= items.length) return;
      results[current] = await worker(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: limit }, run));
  return results;
}

function decodeHtmlAttribute(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function extractAnchorHrefs(html) {
  const hrefs = [];
  const re = /<a\b[^>]*\bhref=(["'])(.*?)\1/gi;
  let match;
  while ((match = re.exec(html))) {
    hrefs.push(decodeHtmlAttribute(match[2]));
  }
  return hrefs;
}

function normalizeHref(href, pagePath) {
  const trimmed = href.trim();
  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    /^(mailto|tel|sms|javascript|data|blob):/i.test(trimmed)
  ) {
    return null;
  }

  try {
    const url = new URL(
      trimmed.startsWith("//") ? `https:${trimmed}` : trimmed,
      `https://${LIVE_HOST}${pagePath}`,
    );
    return url;
  } catch {
    return null;
  }
}

function isSameDomain(url) {
  return url.hostname === LIVE_HOST || url.hostname === `www.${LIVE_HOST}`;
}

function responseIsRedirect(row) {
  return row.status >= 300 && row.status < 400;
}

const OLD_SITE_RESIDUE = [
  /\/wp-content\//i,
  /\/wp-includes\//i,
  /\/wp-json\b/i,
  /\/wp-admin\b/i,
  /\/wp-login\b/i,
  /\bfusion-/i,
  /\bavada-/i,
  /1376455022940136/,
  /ABC Industries/i,
  /Bryan Calcott/i,
  /9400 Brighton/i,
];

const { total, posts } = fetchLegacyPosts();
const postPaths = posts.map((post) => new URL(post.link).pathname);

const pageRows = await mapLimit(postPaths, CONCURRENCY, async (path) => {
  const row = await requestLive(path);
  const html = row.body ?? "";
  return {
    path,
    status: row.status,
    location: row.location,
    hasNextStatic: html.includes("/_next/static/"),
    hasNextFlight: html.includes("self.__next_f.push"),
    hasBlogTemplate:
      html.includes("BlogPosting") ||
      html.includes("The Berman Brief") ||
      html.includes("Ready to be heard"),
    oldResidue: OLD_SITE_RESIDUE.filter((pattern) => pattern.test(html)).map(
      String,
    ),
    hrefs: extractAnchorHrefs(html),
  };
});

const internalLinks = new Map();
const externalLinks = new Map();
const oldSiteTargets = [];

for (const row of pageRows) {
  for (const href of row.hrefs) {
    const url = normalizeHref(href, row.path);
    if (!url) continue;

    const target = `${url.pathname}${url.search}`;
    if (OLD_SITE_RESIDUE.some((pattern) => pattern.test(url.href))) {
      oldSiteTargets.push({ source: row.path, href: url.href });
    }

    if (isSameDomain(url)) {
      if (!target.startsWith("/_next/")) {
        if (!internalLinks.has(target)) internalLinks.set(target, row.path);
      }
    } else if (!externalLinks.has(url.href)) {
      externalLinks.set(url.href, row.path);
    }
  }
}

const internalRows = await mapLimit(
  Array.from(internalLinks.keys()).sort(),
  CONCURRENCY,
  async (path) => {
    const row = await requestLive(path, "HEAD");
    return {
      path,
      source: internalLinks.get(path),
      status: row.status,
      location: row.location,
    };
  },
);

const result = {
  legacyWpPublishedPostsHeader: total,
  legacyWpPostsFetched: posts.length,
  livePostPagesChecked: pageRows.length,
  postPageFailures: pageRows
    .filter(
      (row) =>
        row.status !== 200 ||
        row.location ||
        !row.hasNextStatic ||
        !row.hasNextFlight ||
        !row.hasBlogTemplate ||
        row.oldResidue.length > 0,
    )
    .map((row) => ({
      path: row.path,
      status: row.status,
      location: row.location,
      hasNextStatic: row.hasNextStatic,
      hasNextFlight: row.hasNextFlight,
      hasBlogTemplate: row.hasBlogTemplate,
      oldResidue: row.oldResidue,
    })),
  uniqueInternalLinksChecked: internalRows.length,
  brokenInternalLinks: internalRows.filter(
    (row) => !row.status || row.status >= 400,
  ),
  redirectingInternalLinks: internalRows.filter(responseIsRedirect),
  oldWordPressTargets: oldSiteTargets,
  uniqueExternalLinksSeen: externalLinks.size,
};

console.log(JSON.stringify(result, null, 2));
