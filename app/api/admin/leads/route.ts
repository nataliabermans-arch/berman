import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/commerce/db";
import { listLeads } from "@/lib/supabase/leads";
import type { Lead } from "@/lib/concierge/types";

export const runtime = "nodejs";

const ALLOWED_STATUSES: Lead["status"][] = [
  "new",
  "contacted",
  "booked",
  "closed",
];

export async function GET(req: NextRequest) {
  const token = req.cookies.get("bermn_admin")?.value;
  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const limitRaw = searchParams.get("limit");
  let limit = limitRaw ? parseInt(limitRaw, 10) : 50;
  if (!Number.isFinite(limit) || limit < 1) limit = 50;
  if (limit > 200) limit = 200;

  const statusParam = searchParams.get("status");
  const status =
    statusParam && (ALLOWED_STATUSES as string[]).includes(statusParam)
      ? (statusParam as Lead["status"])
      : undefined;

  try {
    const leads = await listLeads({ limit, status });
    return NextResponse.json({ leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
