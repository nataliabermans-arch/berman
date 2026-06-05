import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const EXPECTED_REMOTE = "github.com/nataliabermans-arch/berman";
const EXPECTED_BRANCH = "main";
const EXPECTED_VERCEL_PROJECT_ID = "prj_KWuMwni4zUXLUWJGH8SSVl8U7Ukk";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function normalizeRemote(value) {
  return value
    .replace(/^git@github\.com:/, "github.com/")
    .replace(/^https:\/\/github\.com\//, "github.com/")
    .replace(/\.git$/, "");
}

function fail(message) {
  console.error(`Source-of-truth check failed: ${message}`);
  process.exit(1);
}

const remote = normalizeRemote(git(["remote", "get-url", "origin"]));
if (remote !== EXPECTED_REMOTE) {
  fail(
    `origin is ${remote}; expected ${EXPECTED_REMOTE}. Do not deploy from Bryan's reference repo.`,
  );
}

const branch = git(["branch", "--show-current"]);
if (branch !== EXPECTED_BRANCH) {
  fail(`current branch is ${branch}; expected ${EXPECTED_BRANCH}.`);
}

if (existsSync(".vercel/project.json")) {
  const project = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
  if (project.projectId && project.projectId !== EXPECTED_VERCEL_PROJECT_ID) {
    fail(
      `.vercel/project.json points to ${project.projectId}; expected ${EXPECTED_VERCEL_PROJECT_ID}.`,
    );
  }
}

console.log("Source-of-truth check passed: nataliabermans-arch/berman.");
