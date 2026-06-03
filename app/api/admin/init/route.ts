import { NextRequest, NextResponse } from "next/server";
import { runMigrations, verifyAdminToken } from "@/lib/commerce/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("bermn_admin")?.value;
  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runMigrations();
    return NextResponse.json({ ok: true, message: "Schema applied" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
