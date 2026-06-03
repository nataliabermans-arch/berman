import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const DEFAULT_PIPELINE_ID = "eLqGD6YG5VkNOXYqrlux";
const DEFAULT_STAGE_ID = "e3f01ead-c51c-425f-a182-512d88c320bb";

function envValue(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

function envFlag(name: string): boolean | undefined {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return undefined;
  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["0", "false", "no", "off"].includes(value)) return false;
  return undefined;
}

function healthResponse(
  status: number,
  body: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  const token = envValue("GHL_BERMAN_API_TOKEN", "BERMAN_GHL_API_TOKEN");
  const locationId = envValue(
    "GHL_BERMAN_LOCATION_ID",
    "BERMAN_GHL_LOCATION_ID",
  );
  const pipelineId =
    envValue("GHL_BERMAN_PIPELINE_ID", "BERMAN_GHL_PIPELINE_ID") ||
    DEFAULT_PIPELINE_ID;
  const stageId =
    envValue(
      "GHL_BERMAN_PIPELINE_STAGE_ID",
      "BERMAN_GHL_PIPELINE_STAGE_ID",
    ) || DEFAULT_STAGE_ID;
  const requireGhl =
    envFlag("LEAD_DELIVERY_REQUIRE_GHL") ??
    process.env.VERCEL_ENV === "production";
  const createOpportunity =
    envFlag("LEAD_DELIVERY_CREATE_GHL_OPPORTUNITY") ?? true;

  if (!requireGhl) {
    return healthResponse(503, {
      ok: false,
      error: "GHL delivery is not required in this environment.",
    });
  }

  if (!createOpportunity) {
    return healthResponse(503, {
      ok: false,
      error: "GHL opportunity creation is disabled.",
    });
  }

  if (token.length < 20 || locationId.length < 10) {
    return healthResponse(503, {
      ok: false,
      error: "GHL token or location id is missing.",
    });
  }

  const response = await fetch(
    `${GHL_BASE_URL}/opportunities/pipelines?locationId=${encodeURIComponent(
      locationId,
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28",
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return healthResponse(503, {
      ok: false,
      error: `GHL pipeline lookup returned ${response.status}.`,
    });
  }

  const body = (await response.json().catch(() => null)) as {
    pipelines?: Array<{
      id?: string;
      name?: string;
      stages?: Array<{ id?: string; name?: string }>;
    }>;
  } | null;

  const pipeline = body?.pipelines?.find((item) => item.id === pipelineId);
  if (!pipeline) {
    return healthResponse(503, {
      ok: false,
      error: "Configured GHL pipeline was not found.",
    });
  }

  const stage = pipeline.stages?.find((item) => item.id === stageId);
  if (!stage) {
    return healthResponse(503, {
      ok: false,
      error: "Configured GHL pipeline stage was not found.",
    });
  }

  return healthResponse(200, {
    ok: true,
    checks: {
      env: "nonblank",
      requireGhl,
      createOpportunity,
      pipeline: pipeline.name || "configured pipeline",
      stage: stage.name || "configured stage",
    },
  });
}
