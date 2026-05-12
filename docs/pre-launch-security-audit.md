# Pre-Launch Security Audit

This audit focuses on practical launch-readiness risks for the Breaking Ground
Next.js + Sanity site hosted on Vercel. It is not a theoretical pentest; it
prioritizes exposed secrets, unsafe routes, production headers, public exposure,
indexing, and obvious hardening gaps.

## Remediation Status

Implemented after this audit:

- `/api/geojson` now only proxies HTTPS Sanity CDN URLs.
- `/api/chart/[id]` now validates chart CSV asset URLs before fetching.
- `/api/sanity/connect` now returns 404 in production.
- Site-wide security headers are configured in `next.config.ts`.
- `robots.ts` now disallows `/api/` for crawler hygiene.
- CMS-rendered article/ad links are scheme-filtered to `http`, `https`, and
  `mailto`.
- Data insights no longer fetches JSON through an incoming `Host` header.
- The test-named public sparkline JSON was moved into source data.
- Root `.gitignore` now ignores broader env/key file patterns.
- Sanity Vision was removed from the Studio plugin list for launch.

Operational follow-ups that cannot be fully enforced in code:

- Restrict `NEXT_PUBLIC_MAPBOX_TOKEN` to approved production domains in Mapbox.
- Confirm Sanity project membership and roles are limited to trusted users.

## Critical

### Open SSRF / Proxy Route

Path: `nextjs-breaking-ground/src/app/api/geojson/route.ts`

The route accepts any `u` query parameter and server-side fetches that URL:

```text
/api/geojson?u=ANY_URL
```

Why it matters:

- Anyone can use the Vercel server as a fetch proxy.
- This can be abused for SSRF-style probing or open-proxy behavior.
- The client currently intends to proxy Sanity CDN GeoJSON files, but the route
  itself does not enforce that.

Realistic risk: high. This is the most important launch blocker found.

Recommended remediation:

- Restrict the route to `https://cdn.sanity.io` only.
- Reject invalid URLs, non-HTTPS URLs, and non-allowed hosts.
- Return generic upstream errors.

Suggested replacement:

```ts
import {NextRequest, NextResponse} from "next/server";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u");
  if (!raw) return NextResponse.json({error: "Missing u param"}, {status: 400});

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({error: "Invalid URL"}, {status: 400});
  }

  if (url.protocol !== "https:" || url.hostname !== "cdn.sanity.io") {
    return NextResponse.json({error: "URL not allowed"}, {status: 403});
  }

  const res = await fetch(url.toString(), {cache: "no-store"});
  if (!res.ok) {
    return NextResponse.json({error: "Upstream fetch failed"}, {status: 502});
  }

  return NextResponse.json(await res.json(), {
    headers: {"Cache-Control": "no-store"},
  });
}
```

## High

### Missing Production Security Headers

Path: `nextjs-breaking-ground/next.config.ts`

Current state:

- `next.config.ts` only defines legacy article redirects.
- No explicit production security headers are configured.

Why it matters:

- Browsers will not receive site-wide hardening defaults.
- Frame embedding, MIME sniffing, permissions, referrer behavior, and content
  loading policy are currently not explicitly controlled.

Realistic risk: medium-to-high for launch hardening. This is a standard
production-readiness fix.

Recommended configuration:

```ts
import type { NextConfig } from "next";
import slugsManifest from "./config/article-slugs.json";

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
```

Note: the CSP above is intentionally practical for the current app, including
Sanity and Mapbox. It may need adjustment if additional third-party embeds are
added.

### Public Sanity Diagnostic Route

Path: `nextjs-breaking-ground/src/app/api/sanity/connect/route.ts`

Current behavior:

- Public `GET /api/sanity/connect`.
- Returns `projectId`, `dataset`, live `documentCount`, and success message.
- On failure, returns raw error and cause strings.

Why it matters:

- It is a production reconnaissance endpoint.
- It confirms backend service wiring and content volume.
- Raw error strings can reveal implementation details during outages.

Realistic risk: low-to-medium, but embarrassing for public launch.

Recommended remediation:

- Remove the route before launch, or
- Return 404 in production, or
- Gate it with an internal secret/IP allowlist.

Minimal production guard:

```ts
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({error: "Not found"}, {status: 404});
  }

  // Existing diagnostic logic for local development only.
}
```

## Medium

### CMS-Controlled Links Are Not Scheme-Filtered

Path: `nextjs-breaking-ground/src/components/FigmaArticlePage.tsx`

Risk:

- Article links and ad link fields can come from Sanity.
- If an editor account is compromised or bad content is imported, unsafe schemes
  such as `javascript:` could be rendered.

Why it matters:

- This is not an anonymous attacker vector by itself.
- It becomes realistic if CMS permissions are broad or content imports are
  automated.

Recommended remediation:

- Add a URL sanitizer before rendering CMS links.
- Allow only `http:`, `https:`, and `mailto:`.
- Strip or ignore anything else.

Suggested helper:

```ts
function safeHref(raw?: string) {
  if (!raw) return undefined;

  try {
    const url = new URL(raw, "https://example.com");
    if (["http:", "https:", "mailto:"].includes(url.protocol)) {
      return raw;
    }
  } catch {
    return undefined;
  }

  return undefined;
}
```

### Chart API Follows Sanity File URLs Without Host Validation

Path: `nextjs-breaking-ground/src/app/api/chart/[id]/route.ts`

Risk:

- The route fetches `dataFile.asset.url` from Sanity.
- This is expected for chart CSV files, but it trusts the CMS value completely.

Why it matters:

- If CMS data is compromised, the server could fetch an attacker-controlled URL.
- This is less risky than `/api/geojson` because anonymous users cannot directly
  supply the URL, but it is still worth hardening.

Recommended remediation:

- Validate the chart CSV URL before fetch.
- Allow only `https://cdn.sanity.io`.

Suggested guard:

```ts
const url: string | undefined = doc?.dataFile?.asset?.url;
if (url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "cdn.sanity.io") {
    return NextResponse.json({error: "Chart asset URL not allowed"}, {status: 400});
  }
}
```

### Host-Header-Based Fetch In Data Insights

Path: `nextjs-breaking-ground/src/app/sections/data-insights/page.tsx`

Risk:

- The page builds an absolute URL from the incoming `Host` header to fetch
  `/data/sparkline_test.json`.

Why it matters:

- In normal Vercel deployment this is likely fine.
- With proxy/CDN misconfiguration, host-header-derived fetches can behave
  unexpectedly and complicate caching.

Recommended remediation:

- Use a fixed canonical base URL from `SITE_URL`, or
- Import/read the local JSON directly instead of HTTP-fetching it via the host.

### Sanity Studio Vision Tool

Path: `studio-breaking-ground/sanity.config.ts`

Current state:

- `visionTool()` is enabled.

Why it matters:

- This is not a Next.js public-site risk.
- It matters if Studio access is broad, because Vision allows ad-hoc GROQ
  exploration by authorized Studio users.

Recommended remediation:

- Confirm Sanity project membership and roles are tight.
- Consider removing Vision from the deployed Studio if editors do not need it.

## Low

### Environment Variable Findings

Current environment variables found:

- `NEXT_PUBLIC_MAPBOX_TOKEN`
  - Used in `nextjs-breaking-ground/src/components/MapEmbedClient.tsx`.
  - Exposed to the browser by design.
  - Should be restricted in the Mapbox dashboard by allowed URLs/domains.

- `SANITY_WRITE_TOKEN`
  - Used only by `nextjs-breaking-ground/scripts/migrate-articles-to-figma.mjs`
    when `--execute` is passed.
  - Not used by the frontend.
  - Should remain local/CI secret only.

- `NODE_ENV`
  - Used for development behavior.
  - Not sensitive.

No committed `.env`, `.env.local`, or `.env.*` files were found in the current
tree. No hardcoded live tokens, passwords, private keys, or webhook secrets were
found in the current tree.

Git history search flagged commits that mention secret-like terms, but the
matches appear to be environment variable names, placeholders, scripts, or docs,
not actual committed secret values.

### `.gitignore` Hardening

Current root `.gitignore` covers `.env`, `.env.local`, and `.env.*.local`.

Recommended broader coverage:

```gitignore
.env*
!.env.example
.envrc
.direnv/
*.pem
*.key
*.p12
```

Why it matters:

- Prevents accidental commits of `.env.production`, `.env.development`,
  `.envrc`, private keys, and local cert/key files outside the Next app.

### Public Static Data

Path: `nextjs-breaking-ground/public/data/sparkline_test.json`

Risk:

- Publicly served JSON file.
- Name suggests test data in production.
- Content does not appear secret, but it is large and enumerable.

Recommended remediation:

- Rename to production language, such as `insights-sparklines.json`.
- Confirm the file contains only intended public data.

### Tracked Ingest JSON

Path: `data/news-feed-ingest/current-news-feed.json`

Risk:

- Tracked in git.
- Not directly public through `/public`, but visible to anyone with repo access.

Recommended remediation:

- Confirm it is intended to be version-controlled.
- If it is generated operational data, consider ignoring it and producing it as
  a build/deploy artifact instead.

### Robots And Sitemap

Paths:

- `nextjs-breaking-ground/src/app/robots.ts`
- `nextjs-breaking-ground/src/app/sitemap.ts`

Current state:

- `robots.ts` allows all.
- `sitemap.ts` includes public pages, sections, and articles.
- No draft/preview routes were found.

Recommendation:

- If API routes remain public, optionally add `/api/` to robots disallow for
  crawler hygiene.
- This is not a security control.

Suggested robots change:

```ts
rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }]
```

## Sanity Security Summary

Current findings:

- Public Sanity project ID and dataset are hardcoded in normal places. This is
  expected for Sanity public-read setups and is not a secret.
- The frontend Sanity client uses no token.
- No draft mode, preview secret, or token-bearing preview implementation was
  found in the Next app.
- Chart and article content are read from the public production dataset.
- Studio is a separate app; no embedded `/studio` route was found inside the
  Next app.

Recommendations:

- Keep Sanity dataset public-read only for content intended to be public.
- Keep all write tokens out of frontend code.
- Tighten Sanity roles before launch.
- Reconsider deployed Studio Vision access.

## API Routes Summary

Routes found:

- `GET /api/geojson`
  - Critical issue: unrestricted fetch proxy.

- `GET /api/chart/[id]`
  - Uses parameterized GROQ by `_id`.
  - Public by design.
  - Should validate Sanity asset host before CSV fetch.

- `GET /api/sanity/connect`
  - Diagnostic route.
  - Should be removed or disabled in production.

No server actions were found. No POST, PUT, PATCH, or DELETE API route handlers
were found.

## Production Readiness Notes

Observed:

- No committed `.env` files.
- No current hardcoded live secrets found.
- No preview/draft implementation found.
- Production browser source maps are not explicitly enabled.
- `next.config.ts` lacks security headers.
- Some console warnings/logging exist in sitemap fallback and chart fetch error
  paths. These are acceptable but should avoid exposing raw errors to public API
  responses.

Top pre-launch fixes:

1. Lock down `/api/geojson`.
2. Add production security headers.
3. Remove or production-disable `/api/sanity/connect`.
4. Add URL scheme filtering for CMS-controlled links.
5. Validate Sanity asset host in `/api/chart/[id]`.
6. Harden `.gitignore`.
