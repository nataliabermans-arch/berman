import { NextRequest, NextResponse } from "next/server";
import { getSalesStats, verifyAdminToken } from "@/lib/commerce/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("bermn_admin")?.value;
  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getSalesStats();
    return NextResponse.json(stats);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
