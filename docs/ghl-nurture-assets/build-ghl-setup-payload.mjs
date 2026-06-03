import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "email-templates");
const confirmation = "CREATE_BERMAN_GHL_A2P_AND_CUSTOM_HTML_ASSETS";

const branchLabels = {
  "menopause-hormones": "Menopause & Hormones",
  "sexual-health": "Sexual Health",
  "pelvic-urinary": "Pelvic & Urinary",
  "vaginal-rejuvenation": "Vaginal Rejuvenation",
  "aesthetic-regenerative": "Aesthetic & Regenerative",
  "body-contouring": "Body Contouring",
  "berman-supplements": "Supplements",
  "not-sure-multiple": "Not Sure / Multiple Reasons",
};

const stepLabels = {
  "00-immediate.html": "00 Immediate",
  "01-day-1.html": "01 Day 1",
  "03-day-3.html": "03 Day 3",
  "07-day-7.html": "07 Day 7",
  "14-day-14.html": "14 Day 14",
};

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function decodeEntities(value) {
  return value.replace(/&amp;/g, "&");
}

function parseComment(html, label) {
  const match = html.match(new RegExp(`<!-- ${label}: (.*?) -->`));
  return match ? decodeEntities(match[1]) : "";
}

const locationId =
  argValue("--location-id") ||
  process.env.GHL_BERMAN_LOCATION_ID ||
  process.env.BERMAN_GHL_LOCATION_ID ||
  "";
const dryRun = !process.argv.includes("--run");
const out = argValue("--out");

if (!locationId.trim()) {
  throw new Error(
    "Missing location id. Pass --location-id or set GHL_BERMAN_LOCATION_ID.",
  );
}

const templates = [];
for (const [branch, branchLabel] of Object.entries(branchLabels)) {
  for (const [file, stepLabel] of Object.entries(stepLabels)) {
    const html = await readFile(path.join(root, branch, file), "utf8");
    templates.push({
      name: `Berman Nurture | ${branchLabel} | ${stepLabel}`,
      subjectLine: parseComment(html, "Subject"),
      previewText: parseComment(html, "Preheader"),
      html,
    });
  }
}

const payload = {
  dryRun,
  confirmLocationId: locationId.trim(),
  templates,
};

if (!dryRun) payload.confirm = confirmation;

const json = JSON.stringify(payload);
if (out) {
  await writeFile(out, json, "utf8");
  console.error(`Wrote ${templates.length} templates to ${out}`);
} else {
  process.stdout.write(json);
}
