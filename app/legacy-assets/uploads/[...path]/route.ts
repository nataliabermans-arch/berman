import https from "node:https";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEGACY_HOST = "bermansexualhealth.com";
const LEGACY_ORIGIN_IP = "50.62.141.127";

function legacyAssetPath(segments: string[]) {
  return `/wp-content/uploads/${segments.map(encodeURIComponent).join("/")}`;
}

function proxyLegacyAsset(
  request: NextRequest,
  segments: string[],
  method: "GET" | "HEAD",
) {
  return new Promise<Response>((resolve) => {
    const upstreamPath = legacyAssetPath(segments);
    const upstreamRequest = https.request(
      {
        hostname: LEGACY_HOST,
        servername: LEGACY_HOST,
        path: upstreamPath,
        method,
        headers: {
          Accept: request.headers.get("accept") ?? "*/*",
          "User-Agent": "BermanWebsiteLegacyAssetProxy/1.0",
        },
        lookup: (_hostname, options, callback) => {
          if (options?.all) {
            callback(null, [{ address: LEGACY_ORIGIN_IP, family: 4 }]);
            return;
          }
          callback(null, LEGACY_ORIGIN_IP, 4);
        },
      },
      (upstream) => {
        const headers = new Headers();
        for (const key of [
          "content-type",
          "content-length",
          "last-modified",
          "etag",
        ]) {
          const value = upstream.headers[key];
          if (typeof value === "string") headers.set(key, value);
        }
        headers.set("cache-control", "public, max-age=31536000, immutable");

        resolve(
          new Response(
            method === "HEAD" ? null : (Readable.toWeb(upstream) as BodyInit),
            {
              status: upstream.statusCode ?? 502,
              headers,
            },
          ),
        );
      },
    );

    upstreamRequest.on("error", () => {
      resolve(new Response("Legacy asset unavailable", { status: 502 }));
    });

    upstreamRequest.end();
  });
}

export function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyLegacyAsset(request, params.path, "GET");
}

export function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyLegacyAsset(request, params.path, "HEAD");
}
