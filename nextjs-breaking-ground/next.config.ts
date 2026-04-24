import type { NextConfig } from "next";
import slugsManifest from "./config/article-slugs.json";

// One 301 per known legacy article slug: /{slug} -> /articles/{slug}.
// The slug list is regenerated at build time by scripts/export-article-slugs.mjs
// (wired via the `prebuild` npm hook). Using an explicit list avoids the risk
// of a catch-all regex accidentally redirecting a future static route.
//
// See breaking-ground/docs/url-migration-plan.md for the rollout plan.
const nextConfig: NextConfig = {
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
