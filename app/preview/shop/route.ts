import { SHOP_HTML } from "./shop-html";

// Serves the self-contained storefront preview at /preview/shop.
// Access is gated in middleware.ts (HTTP Basic password prompt); this handler
// just returns the page. noindex so it never reaches search even if the link
// leaks.
export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  return new Response(SHOP_HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "private, no-store",
    },
  });
}
