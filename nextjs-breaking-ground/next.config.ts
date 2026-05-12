import type { NextConfig } from "next";
import slugsManifest from "./config/article-slugs.json";

// One 301 per known legacy article slug: /{slug} -> /articles/{slug}.
// The slug list is regenerated at build time by scripts/export-article-slugs.mjs
// (wired via the `prebuild` npm hook). Using an explicit list avoids the risk
// of a catch-all regex accidentally redirecting a future static route.
//
// See breaking-ground/docs/url-migration-plan.md for the rollout plan.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
      "img-src 'self' data: blob: https://cdn.sanity.io https://api.mapbox.com https://*.tiles.mapbox.com",
      "font-src 'self' data:",
      "connect-src 'self' https://cdn.sanity.io https://*.api.sanity.io https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },

  async redirects() {
    const slugs: string[] = Array.isArray(slugsManifest?.slugs)
      ? slugsManifest.slugs
      : [];

    return slugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/articles/${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
