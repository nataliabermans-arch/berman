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

// Gate the private storefront preview behind a shared password. A native
// browser Basic-auth prompt is the least-friction way to hand one link +
// password to Dr. Berman without building a login. Any username is accepted;
// only PREVIEW_PASSWORD must match. Not configured -> the page 404s rather
// than sitting open.
function previewGate(req: NextRequest): NextResponse | null {
  const password = process.env.PREVIEW_PASSWORD;
  if (!password) {
    return new NextResponse("Not found", { status: 404 });
  }
  const header = req.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    try {
      const decoded = atob(encoded);
      const supplied = decoded.slice(decoded.indexOf(":") + 1);
      if (supplied === password) return null;
    } catch {
      // fall through to challenge
    }
  }
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Berman preview", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

// Leftovers from the old WordPress site (login page, RSS/Atom feeds under /feed/) that
// Google keeps crawling. They will never exist again, so answer 410 Gone
// instead of redirecting them to the homepage (which Google reads as a soft 404).
const GONE = /^\/(?:wp-login\.php|(?:.+\/)?feed(?:\/.*)?)$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (GONE.test(pathname)) {
    return new NextResponse("Gone", {
      status: 410,
      headers: { "X-Robots-Tag": "noindex", "Cache-Control": "public, max-age=86400" },
    });
  }

  if (pathname.startsWith("/preview")) {
    return previewGate(req) ?? NextResponse.next();
  }

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

export const config = {
  matcher: [
    "/admin/:path*",
    "/preview/:path*",
    "/wp-login.php",
    "/feed/:path*",
    "/:first/feed/:path*",
    "/:first/:second/feed/:path*",
  ],
};
