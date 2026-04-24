# Breaking Ground — Site Structure Audit

_Read-only structural audit of the current state of the Next.js app (`nextjs-breaking-ground/`) and Sanity schemas (`studio-breaking-ground/`). Captured on 2026-04-24. No code was modified._

---

## 1. Route Inventory

### Static page routes

| Route | Source file | Purpose | Data source |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Homepage | Sanity `updatedHomepage` singleton + `figmaArticle` references + local news feed JSON |
| `/about` | `src/app/about/page.tsx` | About page | Hardcoded copy |
| `/contact` | `src/app/contact/page.tsx` | Contact page | Hardcoded copy + `mailto:` |
| `/sponsors` | `src/app/sponsors/page.tsx` | Sponsors placeholder ("Coming soon") | Hardcoded |
| `/news` | `src/app/news/page.tsx` | External-news landing page (paginated) | Local file-based news feed (`src/lib/newsFeed.ts` → `data/news-feed-ingest/…`) |
| `/news-feed` | `src/app/news-feed/page.tsx` | Alias — re-exports `NewsPage` | Same as `/news` |

### Dynamic page routes

| Route | Source file | Resolver | Data source |
|---|---|---|---|
| `/[slug]` | `src/app/[slug]/page.tsx` | Slug-to-article | Sanity `figmaArticle` where `slug.current == $slug` |
| `/sections/[section]` | `src/app/sections/[section]/page.tsx` | Section landing | Sanity `figmaArticle` filtered by `series->slug.current == $seriesSlug` (or `section == "project-profiles"` for the project profiles route specifically) |

### API routes

| Route | Source file | Purpose |
|---|---|---|
| `/api/chart/[id]` | `src/app/api/chart/[id]/route.ts` | Chart data API endpoint |
| `/api/geojson` | `src/app/api/geojson/route.ts` | GeoJSON delivery for map embeds |
| `/api/sanity/connect` | `src/app/api/sanity/connect/route.ts` | Sanity connection/auth helper |

### Routes static vs dynamic — summary

- **Static pages (no params):** `/`, `/about`, `/contact`, `/sponsors`, `/news`, `/news-feed`
- **Dynamic pages:** `/[slug]` (article detail), `/sections/[section]` (section landing)
- **Known section param values (hardcoded in `src/app/sections/[section]/page.tsx`):**
  `local`, `national`, `project-profiles`, `member-profiles`, `features`, `perspectives`, `data-insights`, `ai-in-construction`

No `sitemap.ts`, `robots.ts`, `not-found.tsx`, or `generateStaticParams` helpers exist in the app tree. All Sanity-driven pages use `export const revalidate = 0` (fully dynamic, no ISR).

---

## 2. Article URLs

Article detail pages live at **flat root-level slugs** (`/{slug}`) — there is no section prefix, date prefix, or namespace.

### Current articles in Sanity (as of 2026-04-24)

| Headline | Section | Published | Slug (current URL) |
|---|---|---|---|
| AI In Construction | `features` | 2026-04-22 | `/ai-in-construction` |
| Tax Savings with The OBBB | `perspectives` | 2026-03-11 | `/financial-perspective-schneider-downs` |
| Credit Quality Is Slipping | `perspectives` | 2026-03-11 | `/credit-is-slipping` |
| AI: Opportunity and Risk | `perspectives` | 2026-03-11 | `/legal-perspective-AI` |
| The IBEW Union Hall | `project-profiles` | 2026-03-06 | `/union-hall` |
| National Market Update | `news` | 2026-03-04 | `/jan-2026` |
| Regional Market Update | `news` | 2026-03-04 | `/January-2026` |
| AI In Construction (duplicate title) | `features` | 2026-03-04 | `/AI-In-Construction` |
| Incorporating AI Agents Into Your Business | `perspectives` | 2025-10-30 | `/AI-Agents-Into-Workflows` |
| The OBBB and Construction | `features` | 2025-10-30 | `/One-Big-Beautiful-Bill-Construction` |

### Observed patterns and inconsistencies

- **Casing is inconsistent**: lowercase-kebab (`credit-is-slipping`, `union-hall`, `ai-in-construction`), Title-Case-Kebab (`AI-In-Construction`, `One-Big-Beautiful-Bill-Construction`, `AI-Agents-Into-Workflows`, `January-2026`), and mixed-case (`legal-perspective-AI`) all coexist.
- **Case-sensitive duplicates:** `/ai-in-construction` (April 2026) and `/AI-In-Construction` (March 2026) are two different articles with the same headline — URL uniqueness depends on case, which is a fragile contract on the web.
- **Date-in-slug is inconsistent:** `jan-2026` (abbreviated, lower) and `January-2026` (spelled out, capitalized) coexist for two consecutive "Market Update" articles.
- **Slug content vs title is inconsistent:** some slugs track the headline (`credit-is-slipping` ← "Credit Quality Is Slipping"), some track the brand/category (`financial-perspective-schneider-downs`), some track the topic (`One-Big-Beautiful-Bill-Construction`), some use month-year only. No single slugging rule is applied.
- **Potential route collision risk:** article slug `ai-in-construction` is safe today because the matching section lives at `/sections/ai-in-construction`, not at root. However the flat `/[slug]` resolver means **any future static route at root level** (e.g. adding `/sponsors` already in use, or `/about`, `/contact`, `/news`, `/news-feed`) will silently shadow an article with that slug — there are no guard clauses.

### Where article pages render from

- **Route:** `src/app/[slug]/page.tsx`
- **Fetch:** GROQ query `*[_type == "figmaArticle" && slug.current == $slug][0]{…}`
- **Components:**
  - `src/components/FigmaArticlePage.tsx` — standard article layout (most articles)
  - `src/components/FigmaProfileArticlePage.tsx` — profile-only layout (used when `section == "project-profiles" || "member-profiles"`)
- **Sanity client:** `src/sanity/client.ts` (projectId `y9xwdi89`, dataset `production`, CDN disabled)

---

## 3. Landing Pages

| Route | Purpose | Source | Content population |
|---|---|---|---|
| `/news` | External construction-news feed | `src/app/news/page.tsx` + `FigmaLandingTemplate` (variant `newsFeed`) | **File-based** — ingested JSON manifest in `data/news-feed-ingest/`, read by `src/lib/newsFeed.ts`. Paginated 10/page. All tiles are external `<a target="_blank">` links. |
| `/news-feed` | Alias of `/news` | `src/app/news-feed/page.tsx` → re-exports `NewsPage` | Identical — legacy path, still accepts traffic |
| `/sections/features` | "Features" landing | `/sections/[section]` | **Dynamic** Sanity query by series slug `construction-features` |
| `/sections/project-profiles` | "Project Profiles" landing | `/sections/[section]` | **Dynamic** — special-cased: `*[_type == "figmaArticle" && section == "project-profiles"]` (queries by `section` enum, not by `series`) |
| `/sections/member-profiles` | "Member Profiles" landing | `/sections/[section]` | **Dynamic** by series slug `member-profiles` |
| `/sections/perspectives` | "Perspectives" landing | `/sections/[section]` | **Dynamic** by series slug `construction-perspectives` |
| `/sections/local` | "Local" landing | `/sections/[section]` | **Dynamic** by series slug `regional-market-update` |
| `/sections/national` | "National" landing | `/sections/[section]` | **Dynamic** by series slug `national-market-update` |
| `/sections/data-insights` | "Data Insights" landing | `/sections/[section]` | **Dynamic** by series slug `construction-data` |
| `/sections/ai-in-construction` | "AI In Construction" landing | `/sections/[section]` | **Dynamic** by series slug `ai-in-construction` |
| `/about` | About page | `/about/page.tsx` | **Hardcoded** copy |
| `/contact` | Contact page | `/contact/page.tsx` | **Hardcoded** copy + `mailto:` |
| `/sponsors` | Sponsors page | `/sponsors/page.tsx` | **Hardcoded** "Coming soon" — uses the legacy `Masthead` component (not the Figma top ribbon) |

### Layout component

All `/sections/*` and `/news` pages render through `src/components/landing/FigmaLandingTemplate.tsx`. `/about`, `/contact` render a custom inline layout sharing `HomepageTopRibbon` + `HomepageEventBanner`. `/sponsors` is the lone page still using the **legacy `Masthead`** (pre-Figma) header.

### Configuration constant (source of truth for section routing)

```ts
// src/app/sections/[section]/page.tsx
const SECTIONS: Record<string, { title: string; seriesSlug: string }> = {
  local: { title: "Local", seriesSlug: "regional-market-update" },
  national: { title: "National", seriesSlug: "national-market-update" },
  "project-profiles": { title: "Project Profiles", seriesSlug: "project-profiles" },
  "member-profiles": { title: "Member Profiles", seriesSlug: "member-profiles" },
  features: { title: "Features", seriesSlug: "construction-features" },
  perspectives: { title: "Perspectives", seriesSlug: "construction-perspectives" },
  "data-insights": { title: "Data Insights", seriesSlug: "construction-data" },
  "ai-in-construction": { title: "AI In Construction", seriesSlug: "ai-in-construction" },
};
```

This is a **hardcoded map in application code, not derived from Sanity.** Adding a new section requires a code deploy. It is also the only layer enforcing the `/sections/:section` → `series.slug` binding.

---

## 4. Content Model Overview

Registered Sanity types (`studio-breaking-ground/schemaTypes/index.ts`):

```ts
export const schemaTypes = [
  blockContent, // portable-text body schema (not a document)
  author,
  figmaArticle,
  series,
  chartData,
  mapEmbed,
  updatedHomepage,
];
```

### `figmaArticle` (document) — the primary article type

Field groups: `meta`, `intro`, `sidebar`, `body`, `navigation`.

| Field | Type | Req | Notes |
|---|---|---|---|
| `slug` | slug | ✅ | Source: `headline`. Unique validation: default. |
| `publishedAt` | datetime | ✅ | Initial value: now |
| `readingTime` | number | ✅ | Minutes |
| `section` | string (enum) | ✅ | `features`, `project-profiles`, `member-profiles`, `news`, `perspectives`, `opinion` |
| `category` | string (enum) | — | Legacy: `feature`, `profile`, `news`, `data_trends`. "Informational only; section is the primary classifier." |
| `series` | reference → `series` | — | Optional. Used by `/sections/[section]` to build landings. |
| `introImage` | image (hotspot) | ✅ | |
| `articleTag` | string | ✅ | **Initial value: `"ARTICLE TAG"`** — literal placeholder that leaks into UI unless manually overwritten. Guarded in two render paths (`FigmaArticlePage.tsx`, `sections/[section]/page.tsx`) by falling back when the raw value equals `"ARTICLE TAG"`. |
| `headline` | string | ✅ | |
| `homepageHeadline` | string | — | Optional alt headline shown only on the homepage hero |
| `dek` | text | — | Max 240 chars. "Not currently rendered by the Figma article template." (It IS rendered on the profile article layout.) |
| `author` | reference → `author` | ✅ | |
| `coAuthors` | array → `author` | — | Optional additional authors |
| `authorBio` | text | ✅ | |
| `relatedArticles` | array → `figmaArticle` | ✅ | **`min(2).max(6)`** — cannot publish with fewer than 2 existing articles |
| `body` | `blockContent` | ✅ | Portable Text, see below |
| `nextArticle` | reference → `figmaArticle` | ✅ | **Required** — chicken/egg issue for the first article |

**How section is assigned:** manual selection from the six-value enum on each article.

**How issue is assigned:** there is **no `issue` field** on `figmaArticle`. The concept of a magazine issue does not exist in the current content model. There is no `issue` Sanity type.

**How series is assigned:** optional reference to a `series` document. The `/sections/*` routes use `series.slug` to gather articles — this is the actual mechanism powering landing pages (not the `section` enum, except for `/sections/project-profiles` which uses `section` directly).

**Missing relationships:**

- No `issue` document type or reference
- No `tag`/`topic` taxonomy (`articleTag` is a free-form string, `category` is a 4-value legacy enum)
- `series` ↔ `section` has no enforced mapping — the binding lives in the app's hardcoded `SECTIONS` record, not in Sanity
- `nextArticle` is an arbitrary reference; no ordering concept (no "previous article", no automatic sequence by publishedAt)

### `series` (document)

| Field | Type | Req | Notes |
|---|---|---|---|
| `title` | string | ✅ | |
| `slug` | slug | ✅ | Source: `title`, maxLength 96 |
| `description` | text | — | |
| `seriesImage` | image (hotspot) | — | Fallback image for articles in this series with no image set |

Current series in Sanity: `regional-market-update`, `national-market-update`, `ai-in-construction`, `construction-data` (title: "Data Dives"), `construction-perspectives` (title: "Perspectives"), `member-profiles`, `construction-features` (title: "Features"), `project-profiles`.

### `author` (document)

| Field | Type | Req |
|---|---|---|
| `name` | string | ✅ |
| `slug` | slug (source: `name`) | ✅ |
| `image` | image (hotspot) | — |
| `bio` | text | — |

No author landing page route currently exists (no `/authors/[slug]`).

### `blockContent` (object)

Portable-text body schema used by `figmaArticle.body`. Supports inline block types:

- Standard `block` with rich-text and a `link` annotation (`href`, `openInNewTab`)
- `inlineImage` (image with alignment/size)
- `figure` (image with alignment/size/caption)
- `inlineChart` (reference → `chartData`)
- `chartFigure` (reference → `chartData` with caption/alignment/size)
- `mapEmbed` (reference-object using the `mapEmbed` type)
- `pullQuote` (quote + attribution)
- `adSlot` (686×361 in-body ad slot, added 2026-04-24)

### `chartData` / `mapEmbed`

Supporting data types for inline visualizations inside articles. Both rendered through serializers in `articleComponents` (`FigmaArticlePage.tsx`). Not exposed as standalone routes.

### `updatedHomepage` (singleton-style document)

Configuration for the Figma-designed homepage — hero article reference, tabbed-panel article lists, mid-ad feature, event-banner feature + copy. Edits here hot-reload the homepage layout. There is no `homepage` type to swap in/out; this is the live source.

### Types NOT registered / removed

- Legacy `article`, `homepage`, `projectProfile` types were removed during the Figma rebuild (per git history references in `agent-transcripts`). No remaining documents of these types exist in the current code.

---

## 5. Slug Generation

### Where slugs originate

All slugs are generated inside the **Sanity Studio**, by the default Sanity slug input, using the `options.source` config on each schema:

| Type | Source field | maxLength | Unique check |
|---|---|---|---|
| `figmaArticle.slug` | `headline` | not set | `context.defaultIsUnique` |
| `series.slug` | `title` | 96 | `context.defaultIsUnique` |
| `author.slug` | `name` | not set | none (beyond required validator) |

There is **no custom slugify function** (no `slugify: (input) => …` option). Sanity's default slugifier:
- lowercases
- trims
- replaces runs of non-alphanumeric chars with `-`
- does NOT transliterate accented characters beyond Latin

This default runs **only when the "Generate" button is clicked** in Studio. Editors can (and clearly have) typed/pasted custom slugs that bypass normalization entirely.

### Consistency check

See Section 2 for observed data. Summary of slug-format inconsistencies in production data:

- Casing: lowercase-kebab, Title-Case-Kebab, and mixed-case all present
- Date formatting: `jan-2026` and `January-2026` coexist
- No detectable slug linter or pre-publish validator beyond "required + unique"

### Uniqueness

- Sanity's default uniqueness check is per-document-type and **case-sensitive** (`"ai-in-construction"` and `"AI-In-Construction"` are treated as distinct). This matches the production data — both exist.
- There is no cross-type uniqueness check (e.g. an article slug could collide with a series slug). Not currently a problem because series aren't exposed as public URLs at root — but nothing prevents it.

### Formatting issues

- No `maxLength` on article slugs
- No enforced kebab-case
- Whitespace, leading/trailing hyphens, and non-ASCII characters are not specifically guarded
- Nothing prevents a slug equal to a reserved static route (`about`, `contact`, `news`, `news-feed`, `sponsors`) — if such a slug were saved, the static route would silently win and the article would become unreachable at `/<slug>`.

---

## 6. Linking Behavior

### Helper functions

Centralized helpers in `src/components/FigmaArticlePage.tsx`:

```ts
export function sectionHref(section?: string): string {
  return section ? `/sections/${section}` : "/";
}

export function relatedSlug(ref: RelatedRef | NextRef): string {
  return ref.slug ? `/${ref.slug}` : "/";
}
```

Similar helper in `src/app/page.tsx`:

```ts
const entryHref = (entry?: HomepageEntry | null) => {
  const slug = entry?.slug?.current;
  return slug ? `/${slug}` : "#";
};
```

### Link shape

- **Articles** are always linked as `` `/${slug.current}` `` — flat root-level URL, no section prefix
- **Sections** are always linked as `/sections/${sectionKey}` where `sectionKey` is one of the hardcoded keys in `SECTIONS`
- **News feed items** are **external URLs** (`<a target="_blank">`), not internal links
- **Author pages / series pages** have no route — so those links don't exist

### Where these helpers are used

- Homepage: `entryHref` (hero CTA, event banner CTA, tabbed-panel items, "read more" links)
- Section landing pages: inline `` `/${article.slug.current}` ``
- Article pages: `relatedSlug` (for `relatedArticles[]`, `nextArticle`) and `sectionHref` (for breadcrumbs)

### Inconsistencies / risks

- Three different helper implementations (`entryHref`, `relatedSlug`, inline string templates) all do the same thing but could drift.
- The `Masthead` legacy header (still on `/sponsors`) uses `` `/sections/${item.slug}` `` with a different `SECTION_ITEMS` list that is **not synchronized** with the Figma ribbon's `NAV_ITEMS` or the `SECTIONS` routing map.
- The homepage top ribbon (`NAV_ITEMS` in `src/app/page.tsx` inline + `HomepageTopRibbon.tsx` for landing pages) hardcodes `/sections/*` destinations in two separate places — keeping them in sync is manual.
- Nothing generates a canonical URL for an article. If a slug changes, old URLs 404 with no redirect.

---

## 7. SEO Structure

### Metadata

- **Root metadata** (`src/app/layout.tsx`):
  ```ts
  export const metadata: Metadata = {
    title: "Breaking Ground",
    description: "Breaking Ground – Western Pennsylvania construction news, project profiles, market analysis, and industry intelligence.",
  };
  ```
- **No page-level `metadata` exports** on any other route. `/[slug]`, `/sections/[section]`, `/news`, `/about`, `/contact`, `/sponsors`, `/news-feed` all inherit the root metadata — meaning every page renders with title "Breaking Ground" and the same description in `<head>`.
- **No `generateMetadata`** anywhere. There is no dynamic per-article title, description, Open Graph, or Twitter card metadata.
- **No canonical URLs.** No `alternates.canonical` in metadata. `<link rel="canonical">` is not emitted.

### Sitemap

- **No `sitemap.ts` or `sitemap.xml`** in `src/app/` or `public/`.
- Search engines cannot discover articles except by crawling links from the homepage / section pages.

### robots.txt

- **No `robots.ts` or `robots.txt`** exists. Default Next.js behavior allows all crawlers.

### Structured data (JSON-LD)

- **No `Article`, `NewsArticle`, `BreadcrumbList`, or `Organization` JSON-LD** is emitted anywhere.

### Analytics

- Plausible analytics script is loaded globally in `layout.tsx` (`pa-mwb2bCJn6udlYoy9_0IwT.js`). This is separate from SEO but worth noting as the only external SEO/analytics integration.

### Risks and gaps summary

- Zero article-level SEO metadata means every article has the same title and description in search results.
- No sitemap means slower organic discovery and harder validation in Search Console.
- No canonical tags means the case-sensitive duplicate article pair (`/ai-in-construction` vs `/AI-In-Construction`) and the `/news` / `/news-feed` alias pair both create duplicate-content risk.
- No robots policy, no Open Graph, no Twitter cards — link previews in Slack, Teams, SMS, LinkedIn, and X will be blank or fall back to the root metadata.

---

## 8. Key Findings

### Current URL patterns

- Flat root-level article URLs: `/{slug}` for all article types
- Section namespace: `/sections/{sectionKey}`
- Separate static utility pages at root: `/about`, `/contact`, `/news`, `/news-feed`, `/sponsors`
- External-news items link off-site; only Sanity-authored articles live on the Breaking Ground domain

### Structural inconsistencies

1. **Two parallel "section" taxonomies that don't agree:**
   - The `figmaArticle.section` enum (`features`, `project-profiles`, `member-profiles`, `news`, `perspectives`, `opinion`)
   - The route-level `SECTIONS` map (`local`, `national`, `project-profiles`, `member-profiles`, `features`, `perspectives`, `data-insights`, `ai-in-construction`)
   - The route map drives landings via `series.slug`, not via `section`. Only `/sections/project-profiles` queries by `section`.
   - `news` and `opinion` exist as sections in Sanity but have no landing page. `local`, `national`, `data-insights`, and `ai-in-construction` exist as landing pages but are not valid `section` enum values.
2. **Two parallel header navigations** — the homepage inline ribbon and `HomepageTopRibbon.tsx` — that must be kept in sync manually; plus a third legacy `Masthead` still present on `/sponsors`.
3. **Slug formatting has no enforced rule.** Lowercase kebab, Title-Case kebab, and mixed-case slugs coexist in live content. Two "AI In Construction" articles share a headline and differ only by slug casing.
4. **`articleTag` defaults to the literal string `"ARTICLE TAG"`** and is a required field. This placeholder has leaked to the rendered UI in the past and is guarded by two separate fallback checks in render code.
5. **`relatedArticles` (min 2) and `nextArticle` are required**, creating bootstrapping friction when the corpus is small.
6. **`dek` is described in-schema as "not currently rendered"**, but it is rendered by the profile article layout. Schema documentation is stale.
7. `/news-feed` is an alias of `/news` — legacy compat, identical output.

### Risks for scaling

- **Route shadowing at root.** Any future static route at `/<name>` will silently eclipse an article slug of the same name, making that article unreachable with no warning. Currently reserved by static files: `about`, `contact`, `news`, `news-feed`, `sponsors`, `sections`, `api`. There is no guard inside `/[slug]/page.tsx` that disambiguates.
- **Duplicate-content SEO risk.**
  - Case-sensitive slug duplicates (`/ai-in-construction` and `/AI-In-Construction`) are currently both live as distinct pages.
  - `/news` and `/news-feed` serve identical content with no canonical signal.
- **No slug-change story.** Changing any slug breaks all inbound links and search-engine backlinks. There is no redirect layer, no slug history, no `generateStaticParams` to even detect slug stability.
- **Hardcoded section map in code.** Adding a new section is a code + deploy event, not a Sanity edit. Editors cannot create a new landing page without developer involvement.
- **No SEO metadata per page.** Every page ships the same `<title>` and `<description>`. Organic search cannot distinguish articles from the homepage from the About page.
- **No sitemap / no robots.txt.** Indexing is implicit and slow.
- **`relatedArticles` + `nextArticle` required fields** mean editors must either fake relationships or publish in dependency order; there is no safe "first article" path.
- **`section` enum does not include** all the section landings the site currently exposes (`local`, `national`, `data-insights`, `ai-in-construction`). Articles in those areas rely on the `series` reference instead, so the `section` enum is partially decorative.
- **`articleTag` placeholder leak.** Since the default value is a literal display string, any article saved without overriding it is one render-path regression away from showing `"ARTICLE TAG"` in the UI.
- **No `issue` concept** anywhere in the model, despite the publication being a magazine.
- **Plausible analytics is loaded with no page-view fallback for slug changes**; a URL rename erases historic data for that URL in the analytics dashboard.

### What may cause problems as the site grows

- Content collisions at `/` (future static pages vs article slugs)
- Duplicate articles from inconsistent slug casing
- Organic search ceiling because of missing per-page metadata + sitemap
- Editorial bottleneck: new sections require code deploys; slug discipline requires developer review
- Magazine-issue semantics are impossible to express today
- Section landings can silently go out of sync with what `figmaArticle.section` actually permits

---

_End of audit. This file is a snapshot of structure as of 2026-04-24; regenerate if the content model or routes change._
