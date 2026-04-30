import { client } from "@/sanity/client";

export type AdSurface =
  | "homepage"
  | "memberProfile"
  | "projectProfile"
  | "articles"
  | "news"
  | "data"
  | "insights";

export type AdCreative = {
  _id: string;
  title?: string;
  imageUrl?: string;
  altText?: string;
  clickUrl?: string;
  sponsor?: {
    name?: string;
    tier?: string;
  };
};

const AD_CREATIVES_BY_SURFACE_QUERY = `*[
  _type == "adCreative" &&
  active == true &&
  sponsor->active == true &&
  $surface in sponsor->eligibleSurfaces[] &&
  defined(image.asset) &&
  defined(clickUrl) &&
  defined(altText) &&
  (!defined(startDate) || dateTime(startDate) <= dateTime(now())) &&
  (!defined(endDate) || dateTime(endDate) >= dateTime(now()))
] | order(coalesce(startDate, _createdAt) desc, _updatedAt desc) {
  _id,
  title,
  "imageUrl": image.asset->url,
  altText,
  clickUrl,
  sponsor->{
    name,
    tier
  }
}`;

const options = { next: { revalidate: 0 } };

export async function getAdsForSurface(surface: AdSurface): Promise<AdCreative[]> {
  return client.fetch<AdCreative[]>(AD_CREATIVES_BY_SURFACE_QUERY, { surface }, options);
}

export function selectAd(ads: AdCreative[] | undefined, slotIndex = 0): AdCreative | null {
  if (!ads?.length) return null;
  return ads[Math.abs(slotIndex) % ads.length] ?? null;
}

export function adSurfaceForArticleSection(section?: string): AdSurface {
  switch (section) {
    case "member-profiles":
      return "memberProfile";
    case "project-profiles":
      return "projectProfile";
    case "news":
      return "news";
    case "data-insights":
      return "data";
    default:
      return "articles";
  }
}
