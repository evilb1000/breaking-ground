# URL Migration Plan — `/{slug}` → `/articles/{slug}`

_Plan-only document. No code changes are described as done; this is a sequenced blueprint for the migration._

## Goal

Move all Sanity-authored article URLs from the flat root-level pattern `/{slug}` to a namespaced pattern `/articles/{slug}`, while:

- preserving every existing external backlink via 301 redirects,
- keeping every non-article static/dynamic route untouched (`/about`, `/contact`, `/news`, `/news-feed`, `/sponsors`, `/sections/*`, `/api/*`),
- avoiding any downtime for the article corpus,
- consolidating internal link generation behind a single helper to make future moves cheaper.

---

## 1. Current state (as-is)

### Article route

- File: [breaking-ground/nextjs-breaking-ground/src/app/[slug]/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/[slug]/page.tsx)
- Matches **any** single-segment path at the root (`/<anything>`).
- Resolves a `figmaArticle` document whose `slug.current == $slug` via the GROQ query at the top of that file.
- Renders `FigmaArticlePage` by default, or `FigmaProfileArticlePage` when `section` is `project-profiles` / `member-profiles`.

### Static / dynamic sibling routes that must remain untouched

- `/` — [breaking-ground/nextjs-breaking-ground/src/app/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/page.tsx)
- `/about` — [breaking-ground/nextjs-breaking-ground/src/app/about/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/about/page.tsx)
- `/contact` — [breaking-ground/nextjs-breaking-ground/src/app/contact/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/contact/page.tsx)
- `/sponsors` — [breaking-ground/nextjs-breaking-ground/src/app/sponsors/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/sponsors/page.tsx)
- `/news` — [breaking-ground/nextjs-breaking-ground/src/app/news/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/news/page.tsx)
- `/news-feed` — [breaking-ground/nextjs-breaking-ground/src/app/news-feed/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/news-feed/page.tsx)
- `/sections/[section]` — [breaking-ground/nextjs-breaking-ground/src/app/sections/[section]/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/sections/[section]/page.tsx)
- `/api/chart/[id]`, `/api/geojson`, `/api/sanity/connect` — `src/app/api/**`

### Known article slugs in production (from Sanity, 2026-04-24)

- `ai-in-construction`
- `financial-perspective-schneider-downs`
- `credit-is-slipping`
- `legal-perspective-AI`
- `union-hall`
- `jan-2026`
- `January-2026`
- `AI-In-Construction`
- `AI-Agents-Into-Workflows`
- `One-Big-Beautiful-Bill-Construction`

### Every internal call site that currently builds an article `href`

- `entryHref` — [breaking-ground/nextjs-breaking-ground/src/app/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/page.tsx) (defined around L180, used across hero CTA, event banner, tabbed panel, and elsewhere in `page.tsx`).
- `relatedSlug` — [breaking-ground/nextjs-breaking-ground/src/components/FigmaArticlePage.tsx](breaking-ground/nextjs-breaking-ground/src/components/FigmaArticlePage.tsx) (exported, used for `relatedArticles` list and `nextArticle` CTA).
- Re-imported in [breaking-ground/nextjs-breaking-ground/src/components/FigmaProfileArticlePage.tsx](breaking-ground/nextjs-breaking-ground/src/components/FigmaProfileArticlePage.tsx) (same helper, same behaviour).
- Inline template — [breaking-ground/nextjs-breaking-ground/src/app/sections/[section]/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/sections/[section]/page.tsx) line 159: `` `/${article.slug.current}` ``.

Header navigations (`NAV_ITEMS` in `page.tsx`, `HomepageTopRibbon.tsx`, `Masthead.tsx`) **do not link to individual articles** — they only link to section/static pages — so they are unaffected.

### Infrastructure

- `next.config.ts` exists but is empty (no `redirects()`, no `rewrites()`).
- No `middleware.ts` exists.
- No `sitemap.ts`, `robots.ts`.
- Hosting: Vercel (inferred from `origin/main` push flow). Vercel honors `next.config.ts` `async redirects()` natively.

---

## 2. Target state (to-be)

- Canonical article URL: `/articles/{slug}` (served by a new `src/app/articles/[slug]/page.tsx`).
- Legacy article URL: `/{slug}` continues to work for external backlinks, but responds **HTTP 301** to the new path.
- All internal links point to the new path exclusively.
- No static/dynamic non-article route is affected. The legacy `/[slug]` dynamic route is **removed** from the app tree in the final step so it cannot accidentally match new words.

---

## 3. Design decisions

### 3.1 Redirect mechanism — recommended: explicit slug list in `next.config.ts`

Three candidate approaches were considered. The recommended approach is **C**.

**A. Regex redirect with negative lookahead (simple, risky).**
One rule in `next.config.ts` that matches `/:slug` excluding every reserved segment (`about`, `contact`, `news`, `news-feed`, `sponsors`, `sections`, `articles`, `api`, `_next`, `figma-assets`, `favicon.ico`, etc.). Pros: zero data dependency. Cons: anything new added at the root in the future (new static route, new top-level path, new static asset) that isn't added to the exclusion list will be silently redirected into `/articles/<whatever>` and produce a 404 — a silent failure mode that's easy to miss.

**B. Middleware-based slug-aware redirect.**
`src/middleware.ts` that holds a manifest of known article slugs (loaded at module init from a JSON file, or from Sanity at cold-start). On each request, if the first segment exactly matches a known slug AND the second segment is absent, redirect. Pros: only redirects real articles. Cons: introduces middleware complexity; risk of cold-start latency; manifest needs to be kept in sync.

**C. Build-time slug manifest read by `next.config.ts`. [RECOMMENDED]**
At build time, run a small script (e.g. `scripts/export-article-slugs.ts`) that queries Sanity for every `figmaArticle` slug and writes `config/article-slugs.json`. `next.config.ts` imports that JSON in its `async redirects()` function and emits **one explicit 301 entry per slug**. Pros:
- Exactly-known redirect set; no chance of catching a non-article path.
- 301 responses are served at the edge by Vercel with no middleware hop.
- The slug manifest is in version control and can be diffed in PRs.
- New articles are picked up at the next production build.
Cons: freshly published articles need a redeploy to pick up their legacy redirect (acceptable — legacy URLs by definition exist only for articles already published before the cutover).

All three are documented below so the team can revisit; the sequenced plan in Section 4 assumes **C**.

### 3.2 Keeping the old route during transition — recommended: short overlap then remove

To minimize risk, `/{slug}` should keep resolving to article detail pages for a brief overlap window (roughly: the deploy that adds `/articles/[slug]` + internal-link updates). After the redirect manifest is generated and deployed, the old `/[slug]` route file is deleted and any subsequent hit to `/{slug}` is handled by the 301 rule, not by the app tree.

The alternative — cut over in one deploy — is doable and simpler, but relies on zero internal links still pointing at `/{slug}` at the moment of the cutover. Given there are only four link-generation sites (see Section 1), a single-deploy cutover is viable. The plan below uses the safer two-deploy approach by default; a one-deploy variant is called out inline.

### 3.3 Single helper for article paths

All four link-generation sites should call one helper (proposed: `articleHref(slug: string)` in `src/lib/urls.ts`). This guarantees future URL moves require editing one file. The helper is added in Step 2 below.

---

## 4. Migration steps

### Step 0 — Pre-flight (no code changes)

- [ ] Confirm the production Sanity slug list matches the 10 slugs above. Re-fetch via:
  ```
  curl -s 'https://y9xwdi89.api.sanity.io/v2024-01-01/data/query/production?query=*%5B_type%3D%3D%22figmaArticle%22%20%26%26%20defined(slug.current)%5D%7B%22slug%22%3Aslug.current%7D'
  ```
- [ ] Confirm external infrastructure (Vercel project, any Cloudflare layer) has no conflicting redirect rules that would fight with `next.config.ts`. Check the Vercel dashboard's "Redirects" and "Rewrites" panels.
- [ ] Decide: single-deploy cutover or two-deploy overlap (default: two-deploy).
- [ ] Decide: redirect mechanism (default: C — build-time manifest).
- [ ] Take note of any marketing URLs actively in play (MBA newsletter, LinkedIn posts, email signatures) so they can be retested post-cutover.

### Step 1 — Add the new route `/articles/[slug]`

- [ ] Create `breaking-ground/nextjs-breaking-ground/src/app/articles/[slug]/page.tsx`.
- [ ] Copy the full contents of the existing [breaking-ground/nextjs-breaking-ground/src/app/[slug]/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/[slug]/page.tsx) verbatim.
- [ ] No other changes at this step. Both `/{slug}` and `/articles/{slug}` now render the same article. This is intentional — it guarantees the new URL works before any traffic is pointed at it.
- [ ] Smoke test: visit `/articles/union-hall` (or any known slug) in a preview deploy and confirm it renders identically to `/union-hall`.

### Step 2 — Centralize article link generation

- [ ] Create `breaking-ground/nextjs-breaking-ground/src/lib/urls.ts`:

  ```ts
  export function articleHref(slug?: string | null): string {
    return slug ? `/articles/${slug}` : "#";
  }
  ```

- [ ] Rewrite the four call sites to use `articleHref`:
  - `entryHref` in [src/app/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/page.tsx): replace body with `return articleHref(entry?.slug?.current)`.
  - `relatedSlug` in [src/components/FigmaArticlePage.tsx](breaking-ground/nextjs-breaking-ground/src/components/FigmaArticlePage.tsx): replace body with `return articleHref(ref.slug)` and keep the exported signature so existing imports keep working.
  - `FigmaProfileArticlePage.tsx` automatically picks up the change via its re-import of `relatedSlug`.
  - [src/app/sections/[section]/page.tsx](breaking-ground/nextjs-breaking-ground/src/app/sections/[section]/page.tsx) line 159: replace the inline template with `articleHref(article.slug?.current)`.
- [ ] Grep-verify there are no other `` `/${…slug…}` `` patterns building article URLs:
  ```
  rg -n "/\\\${.*slug" breaking-ground/nextjs-breaking-ground/src
  ```
- [ ] Run the dev server and click through: homepage hero, tabbed panel, event banner, section landings, related articles sidebar, next-article CTA, profile-layout sidebar. Every article click should land on `/articles/<slug>`.
- [ ] At this point `/{slug}` still serves articles, but nothing on the site links there anymore.

### Step 3 — Build-time slug manifest + redirect config

- [ ] Create `breaking-ground/nextjs-breaking-ground/scripts/export-article-slugs.ts`. At a high level it should:
  1. Fetch `*[_type == "figmaArticle" && defined(slug.current)]{"slug": slug.current}` using `next-sanity` (same `projectId` / `dataset` as `src/sanity/client.ts`).
  2. Sort slugs alphabetically.
  3. Write `config/article-slugs.json` as `{ "slugs": ["..."] }`.
- [ ] Wire the script into the build command so `vercel build` always regenerates the manifest. Simplest approach: add a `prebuild` script in `package.json`:
  ```json
  "scripts": {
    "prebuild": "tsx scripts/export-article-slugs.ts",
    "build": "next build"
  }
  ```
- [ ] Check the generated `config/article-slugs.json` into the repo (it's also fine to `.gitignore` it — the prebuild step regenerates on every build).
- [ ] Edit `breaking-ground/nextjs-breaking-ground/next.config.ts`:

  ```ts
  import type { NextConfig } from "next";
  import slugsJson from "./config/article-slugs.json";

  const nextConfig: NextConfig = {
    async redirects() {
      return slugsJson.slugs.map((slug: string) => ({
        source: `/${slug}`,
        destination: `/articles/${slug}`,
        permanent: true, // 301
      }));
    },
  };

  export default nextConfig;
  ```

- [ ] Deploy. Verify in a preview:
  - `curl -I https://<preview-host>/union-hall` returns `301` with `Location: /articles/union-hall`.
  - `curl -I https://<preview-host>/articles/union-hall` returns `200`.
  - `curl -I https://<preview-host>/about` returns `200` (unchanged).
  - `curl -I https://<preview-host>/sections/features` returns `200` (unchanged).
  - `curl -I https://<preview-host>/news` returns `200` (unchanged).
  - `curl -I https://<preview-host>/slug-that-does-not-exist` returns `404` from the `/[slug]` dynamic handler (still present at this point — cleaned up in Step 4).

### Step 4 — Remove the legacy `/[slug]` route

Only after Step 3 is live in production and redirects are confirmed:

- [ ] Delete `breaking-ground/nextjs-breaking-ground/src/app/[slug]/page.tsx` and its parent `[slug]` directory.
- [ ] Deploy. All legacy `/{slug}` traffic is now handled purely by the 301 rule from Step 3; nothing in the app tree matches a bare root slug anymore, so unknown legacy URLs (typos, deleted articles) will 404 instead of silently trying to resolve.
- [ ] Smoke test the same curl checks as Step 3 plus: `curl -I https://<host>/unknown-slug-xyz` should return `404` (the `/[slug]` catch-all is gone, so this goes to the Next.js default `not-found`).

### Step 5 — SEO tidy-up (optional but recommended as part of the same migration)

- [ ] Emit a `sitemap.ts` listing every `/articles/{slug}` plus the static pages.
- [ ] Update the Sanity Studio slug validator (in [breaking-ground/studio-breaking-ground/schemaTypes/figmaArticle.ts](breaking-ground/studio-breaking-ground/schemaTypes/figmaArticle.ts)) to forbid slug values that match reserved static paths (see Section 5.2). This prevents re-introducing the shadowing problem after the migration.
- [ ] If Google Search Console is configured, submit the new sitemap.

---

## 5. Edge cases

### 5.1 Case-sensitive duplicate slugs

Two articles exist with slugs that differ only in case:

- `/ai-in-construction` (April 2026)
- `/AI-In-Construction` (March 2026)

The recommended plan preserves both: each gets its own 301 because each appears as a distinct entry in the Sanity slug manifest. Post-migration both `/articles/ai-in-construction` and `/articles/AI-In-Construction` will exist.

Risk: neither the migration nor any existing guard resolves the underlying duplicate. Canonicalizing them is a content-editorial decision and is **out of scope** for this plan.

### 5.2 Reserved paths that must not be redirected

Current reserved top-level paths that must return their own content (never redirect):

- `/` — homepage
- `/about`
- `/contact`
- `/sponsors`
- `/news`
- `/news-feed`
- `/sections/...`
- `/api/...`
- `/_next/...` (framework)
- `/figma-assets/...` (static assets under `public/figma-assets/`)
- Future: `/favicon.ico`, `/robots.txt`, `/sitemap.xml`

Under recommended approach C, **none of these are at risk** because the redirect set is an explicit list of Sanity slugs, so unless a slug literally equals one of these names, there is no collision. The Sanity slug validator update in Step 5 is the permanent guardrail.

Under approach A (regex), all of the above need to be in the negative-lookahead exclusion list, and the list must be updated whenever a new reserved path is added. This is the main reason approach C is recommended.

### 5.3 Case sensitivity of URLs

Vercel / Next.js redirects are case-sensitive by default. `/Union-Hall` will **not** match a `/union-hall` redirect rule. Given production data already contains mixed-case slugs (`AI-In-Construction`, `January-2026`), each slug is added to the manifest with its exact case. No normalization is attempted during migration.

If the team later decides to case-normalize slugs, that is a separate migration (rename slugs in Sanity, update manifest, add case-insensitive redirect rules). It should not be bundled with this work.

### 5.4 Trailing slashes

Next.js strips trailing slashes by default (`trailingSlash: false`). `/union-hall/` becomes `/union-hall` before routing. No special handling needed.

### 5.5 Stale redirect cache (301 is cacheable forever)

301 responses are cached aggressively by browsers and CDNs. Once a user's browser caches `/union-hall → /articles/union-hall`, it will keep honoring that redirect even if we later remove the rule. This is acceptable for this migration because the destination `/articles/union-hall` is designed to be stable.

Consequence: **do not reuse a legacy `/{slug}` URL for a different purpose in the future**, since a material portion of past visitors will never hit your new content at that URL.

### 5.6 External routes that embed article slugs

Check for:
- Email newsletter links (MBA and others that may have used `mbawpa.org/breakingground/<slug>`).
- LinkedIn / Twitter shares with deep links.
- Any `rel.slug` or `next.slug` values currently inside Sanity `relatedArticles` / `nextArticle` references — these are just raw slug strings, not full URLs, so they automatically benefit from the updated `articleHref` helper. Nothing to migrate on the content side.

### 5.7 The `/news-feed` legacy alias

Not affected by this migration (it's a static-route alias, not an article path), but flagged because it is a separate latent duplicate-content issue worth addressing independently.

---

## 6. Rollout and verification checklist

### Deploy 1 (Steps 1–2: new route + internal-link cutover)

- [ ] `/articles/<any-known-slug>` returns 200 and renders the article.
- [ ] `/<any-known-slug>` still returns 200 (legacy).
- [ ] Every visible link on the homepage, section landings, and article pages points to `/articles/...`.
- [ ] Grep the deployed source bundle (or local build) for `` `/${`-style article paths — should return 0 matches.

### Deploy 2 (Step 3: redirects)

- [ ] For every slug in `config/article-slugs.json`:
  - `curl -sI https://breakingground.pub/<slug>` returns `HTTP/2 301` and `location: /articles/<slug>`.
  - `curl -sI https://breakingground.pub/articles/<slug>` returns `HTTP/2 200`.
- [ ] `/about`, `/contact`, `/news`, `/news-feed`, `/sponsors`, `/sections/features` (and at least one other section) each return `HTTP/2 200`.
- [ ] Plausible analytics dashboard does not show a spike in 404s or redirect-related anomalies.

### Deploy 3 (Step 4: remove legacy route)

- [ ] Same checks as Deploy 2.
- [ ] Additionally: `/some-slug-that-was-never-real` returns `HTTP/2 404` (previously this would have hit the `/[slug]` dynamic handler and shown an "Article not found" message — that's fine, just verify the behavior).

---

## 7. Risk summary

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| A non-article route is accidentally redirected | Low (under approach C) | High (silent 404) | Use approach C; the redirect set is an explicit slug list from Sanity. |
| A new article is published between manifest generation and redeploy | Medium | Low | Rebuild after each Sanity publish (standard Vercel practice); legacy URL 301 for that article isn't needed because no external backlinks exist yet. |
| An internal link is missed during the cutover | Low | Low | Grep check + the legacy `/[slug]` route stays live through Step 3. Worst case: user visits `/slug`, 301s to `/articles/slug`, lands fine. |
| Case-sensitive duplicate slugs cause confusion | Already present | Editorial only | Out of scope for this migration. Flag for editorial follow-up. |
| 301 is cached forever and blocks reuse of a legacy URL | By design | None if destination stays stable | Document: do not reuse legacy `/{slug}` paths for other content types in the future. |
| `scripts/export-article-slugs.ts` fails at build time (Sanity outage) | Low | High (build break) | Script should fall back to the last committed `config/article-slugs.json` and log a warning rather than exiting non-zero. |

---

## 8. Open decisions (to confirm before implementation)

1. **Redirect mechanism:** A (regex), B (middleware), or C (build-time manifest). Default: **C**.
2. **Cutover strategy:** two-deploy overlap (default) vs single-deploy cutover.
3. **Should the plan include a `/articles` index/archive page?** The spec doesn't require one, but Next will 404 on `/articles` without a `src/app/articles/page.tsx`. Options: (a) leave as a hard 404, (b) redirect `/articles` → `/news`, (c) build a simple archive listing. Default: **(a) hard 404** — safest, no scope creep. Revisit later.
4. **Sanity slug validator tightening (Step 5):** do we want to block slugs that equal reserved path names (`about`, `contact`, `news`, etc.) right now, or defer?
5. **Bundle in sitemap + per-article `generateMetadata`?** Partially addresses the gaps the audit surfaced. Default: defer to a separate migration to keep this one focused.

---

_End of plan. This document is the reference for the next three deploys. Tick the boxes as each step ships._
