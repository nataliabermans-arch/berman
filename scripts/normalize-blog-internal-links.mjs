import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content", "journal");
const SAME_DOMAIN = /^https?:\/\/(?:www\.)?bermansexualhealth\.com/i;

function normalizeInternalUrl(raw) {
  let url = raw.replace(SAME_DOMAIN, "");

  if (url.startsWith("/journal/")) {
    url = `/${url.slice("/journal/".length)}`;
  }

  if (!url.startsWith("/")) return raw;
  if (
    url.startsWith("/_next/") ||
    url.startsWith("/legacy-assets/") ||
    url.startsWith("/wp-content/")
  ) {
    return url;
  }

  const hashIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  const splitIndex = [hashIndex, queryIndex]
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  const pathPart = splitIndex >= 0 ? url.slice(0, splitIndex) : url;
  const suffix = splitIndex >= 0 ? url.slice(splitIndex) : "";

  if (
    pathPart !== "/" &&
    !pathPart.endsWith("/") &&
    !/\.[a-z0-9]{2,6}$/i.test(pathPart)
  ) {
    return `${pathPart}/${suffix}`;
  }

  return `${pathPart}${suffix}`;
}

function normalizeMarkdownLinks(input) {
  let output = input.replace(
    /\]\((https?:\/\/(?:www\.)?bermansexualhealth\.com[^)\s]*)\)/g,
    (_match, url) => `](${normalizeInternalUrl(url)})`,
  );

  output = output.replace(
    /\]\((\/[^)\s]*)\)/g,
    (_match, url) => `](${normalizeInternalUrl(url)})`,
  );

  output = output.replace(
    /\bhref=(["'])(https?:\/\/(?:www\.)?bermansexualhealth\.com[^"']*)\1/g,
    (_match, quote, url) => `href=${quote}${normalizeInternalUrl(url)}${quote}`,
  );

  output = output.replace(
    /\bhref=(["'])(\/[^"']*)\1/g,
    (_match, quote, url) => `href=${quote}${normalizeInternalUrl(url)}${quote}`,
  );

  return output;
}

let changed = 0;
for (const file of fs.readdirSync(CONTENT_DIR)) {
  if (!file.endsWith(".md")) continue;
  const fullPath = path.join(CONTENT_DIR, file);
  const original = fs.readFileSync(fullPath, "utf8");
  const normalized = normalizeMarkdownLinks(original);
  if (normalized !== original) {
    fs.writeFileSync(fullPath, normalized);
    changed += 1;
  }
}

console.log(JSON.stringify({ changedMarkdownFiles: changed }, null, 2));
