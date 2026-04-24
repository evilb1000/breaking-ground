// Single source of truth for article URLs. Every component that builds a link
// to an article should go through this helper so a future path change requires
// editing one file instead of chasing call sites.
//
// See breaking-ground/docs/url-migration-plan.md for the rationale and the
// legacy-to-new URL cutover strategy.
export function articleHref(slug?: string | null): string {
  return slug ? `/articles/${slug}` : "#";
}
