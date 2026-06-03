import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_PIPELINE_ID = "eLqGD6YG5VkNOXYqrlux";
const DEFAULT_STAGE_ID = "e3f01ead-c51c-425f-a182-512d88c320bb";

function parseArgs(argv) {
  const args = {
    envFile: "",
    liveUrl: "",
    pullProductionEnv: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--env-file") args.envFile = argv[++i] || "";
    else if (arg === "--live-url") args.liveUrl = argv[++i] || "";
    else if (arg === "--pull-production-env") args.pullProductionEnv = true;
    else if (arg === "--help" || arg === "-h") {
      console.log(
        [
          "Usage:",
          "  npm run verify:ghl -- --live-url https://bermansexualhealth.com",
          "  npm run verify:ghl -- --env-file /path/to/.env --live-url https://bermansexualhealth.com",
          "",
          "This check does not create leads. Against a live URL, it verifies the",
          "deployed GHL health endpoint and the contact API validation path.",
          "With --env-file, it also verifies local env against GHL directly.",
        ].join("\n"),
      );
      process.exit(0);
    }
  }

  return args;
}

function parseEnvFile(path) {
  const env = {};
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

function loadEnv(args) {
  if (!args.pullProductionEnv && !args.envFile) return { ...process.env };

  let envPath = args.envFile;
  let tempDir = "";
  if (args.pullProductionEnv) {
    tempDir = mkdtempSync(join(tmpdir(), "berman-ghl-check-"));
    envPath = join(tempDir, ".env.production.local");
    const pulled = spawnSync(
      "vercel",
      ["env", "pull", envPath, "--environment=production", "--yes"],
      { encoding: "utf8" },
    );
    if (pulled.status !== 0) {
      throw new Error(
        `vercel env pull failed: ${pulled.stderr || pulled.stdout}`.trim(),
      );
    }
  }

  try {
    return { ...process.env, ...parseEnvFile(envPath) };
  } finally {
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  }
}

function envValue(env, ...names) {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return "";
}

function envFlag(env, name) {
  const value = env[name]?.trim().toLowerCase();
  if (!value) return undefined;
  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["0", "false", "no", "off"].includes(value)) return false;
  return undefined;
}

function fail(message) {
  throw new Error(message);
}

function assertEnv(env) {
  const token = envValue(env, "GHL_BERMAN_API_TOKEN", "BERMAN_GHL_API_TOKEN");
  const locationId = envValue(
    env,
    "GHL_BERMAN_LOCATION_ID",
    "BERMAN_GHL_LOCATION_ID",
  );
  const pipelineId =
    envValue(env, "GHL_BERMAN_PIPELINE_ID", "BERMAN_GHL_PIPELINE_ID") ||
    DEFAULT_PIPELINE_ID;
  const stageId =
    envValue(
      env,
      "GHL_BERMAN_PIPELINE_STAGE_ID",
      "BERMAN_GHL_PIPELINE_STAGE_ID",
    ) || DEFAULT_STAGE_ID;
  const requireGhl =
    envFlag(env, "LEAD_DELIVERY_REQUIRE_GHL") ??
    (envValue(env, "VERCEL_ENV") === "production" ||
      Boolean(token && locationId));
  const createOpportunity =
    envFlag(env, "LEAD_DELIVERY_CREATE_GHL_OPPORTUNITY") ?? true;

  if (token.length < 20) fail("GHL token is missing or suspiciously short.");
  if (locationId.length < 10)
    fail("GHL location id is missing or suspiciously short.");
  if (!requireGhl) fail("LEAD_DELIVERY_REQUIRE_GHL is not enabled.");
  if (!createOpportunity)
    fail("LEAD_DELIVERY_CREATE_GHL_OPPORTUNITY is not enabled.");

  return { token, locationId, pipelineId, stageId };
}

async function verifyGhl({ token, locationId, pipelineId, stageId }) {
  const response = await fetch(
    `https://services.leadconnectorhq.com/opportunities/pipelines?locationId=${encodeURIComponent(
      locationId,
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28",
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    fail(`GHL pipeline lookup failed with HTTP ${response.status}.`);
  }

  const body = await response.json().catch(() => null);
  const pipelines = Array.isArray(body?.pipelines) ? body.pipelines : [];
  const pipeline = pipelines.find((item) => item.id === pipelineId);
  if (!pipeline) fail(`Configured GHL pipeline was not found: ${pipelineId}`);

  const stages = Array.isArray(pipeline.stages) ? pipeline.stages : [];
  const stage = stages.find((item) => item.id === stageId);
  if (!stage) fail(`Configured GHL pipeline stage was not found: ${stageId}`);

  return { pipelineName: pipeline.name, stageName: stage.name };
}

async function verifyLiveRoute(liveUrl) {
  if (!liveUrl) return null;
  const base = liveUrl.replace(/\/+$/, "");
  const response = await fetch(`${base}/api/contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid" }),
  });
  const body = await response.json().catch(() => null);

  if (response.status !== 400 || body?.error !== "First name is required") {
    fail(
      `Live contact API validation check failed: HTTP ${response.status}, ${JSON.stringify(
        body,
      )}`,
    );
  }

  return { status: response.status, error: body.error };
}

async function verifyLiveHealth(liveUrl) {
  if (!liveUrl) return null;
  const base = liveUrl.replace(/\/+$/, "");
  const response = await fetch(`${base}/api/health/ghl`, {
    headers: { Accept: "application/json" },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok || body?.ok !== true) {
    fail(
      `Live GHL health check failed: HTTP ${response.status}, ${JSON.stringify(
        body,
      )}`,
    );
  }

  return body.checks || { status: response.status };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let ghl = null;
  let liveHealth = null;
  if (args.envFile || args.pullProductionEnv || !args.liveUrl) {
    const env = loadEnv(args);
    const config = assertEnv(env);
    ghl = await verifyGhl(config);
  }

  if (args.liveUrl) {
    liveHealth = await verifyLiveHealth(args.liveUrl);
  }

  const route = await verifyLiveRoute(args.liveUrl);

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: {
          env: ghl ? "nonblank" : "verified in deployed runtime",
          ghlPipeline: ghl,
          liveHealth,
          liveRoute: route,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(`GHL intake verification failed: ${err.message}`);
  process.exit(1);
});
