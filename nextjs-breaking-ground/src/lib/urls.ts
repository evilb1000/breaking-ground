// Single source of truth for article URLs. Every component that builds a link
// to an article should go through these helpers so a future path or domain
// change requires editing one file instead of chasing call sites.
//
// See breaking-ground/docs/url-migration-plan.md for the rationale and the
// legacy-to-new URL cutover strategy.

// Canonical production origin. Used by both server-side SEO metadata and
// client-side share buttons so the URL we advertise to crawlers (LinkedIn,
// X, Facebook, etc.) always matches the URL that actually serves the OG tags.
export const SITE_URL = "https://www.breakinggroundpittsburgh.com";

export function articleHref(slug?: string | null): string {
  return slug ? `/articles/${slug}` : "#";
}

// Fully-qualified article URL for share buttons, canonical tags, OG `url`, etc.
// Falls back to the site root when no slug is available so social widgets
// never dereference a `#` anchor as the shared URL.
export function articleUrl(slug?: string | null): string {
  return slug ? `${SITE_URL}${articleHref(slug)}` : SITE_URL;
}
