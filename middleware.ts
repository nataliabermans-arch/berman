import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const adminSecret = process.env.ADMIN_JWT_SECRET;
const SECRET = new TextEncoder().encode(
  adminSecret ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "dev-fallback-secret-change-me"),
);

async function verify(token?: string): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (!adminSecret && process.env.NODE_ENV === "production") {
    return new NextResponse("Admin is not configured.", { status: 404 });
  }

  const token = req.cookies.get("bermn_admin")?.value;
  const valid = await verify(token);

  if (pathname === "/admin/login") {
    if (valid) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  if (!valid) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
