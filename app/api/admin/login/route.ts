import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export const runtime = "nodejs";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "dev-fallback-secret-change-me"),
);
const USERNAME =
  process.env.ADMIN_USERNAME ??
  (process.env.NODE_ENV === "production" ? "" : "admin");
const PASSWORD =
  process.env.ADMIN_PASSWORD ??
  (process.env.NODE_ENV === "production"
    ? ""
    : "change-this-before-production");
const MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.ADMIN_JWT_SECRET ||
      !process.env.ADMIN_USERNAME ||
      !process.env.ADMIN_PASSWORD)
  ) {
    return NextResponse.json(
      { error: "Admin is not configured" },
      { status: 404 },
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = (await req.json()) as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (username !== USERNAME || password !== PASSWORD) {
    return NextResponse.json(
      { error: "Wrong username or password" },
      { status: 401 },
    );
  }

  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("bermn_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}
