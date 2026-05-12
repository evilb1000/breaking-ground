import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/urls";

// Directs crawlers at our sitemap and otherwise lets them index the whole
// public site. Next.js will serve this at /robots.txt automatically.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
