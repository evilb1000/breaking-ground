import { client } from "@/sanity/client";

export type AdSurface =
  | "homepage"
  | "memberProfile"
  | "projectProfile"
  | "articles"
  | "news"
  | "data"
  | "insights";

export type SponsorTier = "founder" | "partner" | "network" | "courtesy";

export type SponsorBusinessCategory =
  | "legal"
  | "financialServices"
  | "insuranceRisk"
  | "architectureEngineering"
  | "generalContractor"
  | "specialtyContractor"
  | "constructionManagement"
  | "realEstateDevelopment"
  | "buildingMaterialsSuppliers"
  | "technology"
  | "workforceTrainingEducation"
  | "associationCivicPublic";

export type AdPlacement =
  | "homepageSponsor"
  | "profileFounder"
  | "profilePartner"
  | "standardArticle"
  | "newsFeed"
  | "data"
  | "insights";

export type AdCreative = {
  _id: string;
  title?: string;
  imageUrl?: string;
  altText?: string;
  clickUrl?: string;
  sponsor?: {
    _id?: string;
    name?: string;
    tier?: string;
    businessCategory?: SponsorBusinessCategory;
  };
};

export type AdConflictSponsor = {
  _id?: string;
  businessCategory?: SponsorBusinessCategory;
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
    _id,
    name,
    tier,
    businessCategory
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

const TIER_PRIORITY_BY_PLACEMENT: Record<AdPlacement, SponsorTier[]> = {
  homepageSponsor: ["founder", "courtesy"],
  profileFounder: ["founder", "courtesy"],
  profilePartner: ["partner", "courtesy"],
  standardArticle: ["network", "courtesy"],
  newsFeed: ["network", "courtesy"],
  data: ["network", "courtesy"],
  insights: ["network", "courtesy"],
};

function rotationSeed(date = new Date()) {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
}

function contextSeed(contextKey?: string) {
  if (!contextKey) return 0;

  let hash = 0;
  for (let i = 0; i < contextKey.length; i += 1) {
    hash = (hash * 31 + contextKey.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function adsForTier(ads: AdCreative[], tier: SponsorTier) {
  return ads.filter((ad) => ad.sponsor?.tier === tier);
}

function sponsorKey(ad: AdCreative): string {
  return ad.sponsor?._id || ad.sponsor?.name || ad._id;
}

function sponsorBalancedAds(ads: AdCreative[], seed: number): AdCreative[] {
  const groups = new Map<string, AdCreative[]>();

  for (const ad of ads) {
    const key = sponsorKey(ad);
    const group = groups.get(key);
    if (group) {
      group.push(ad);
    } else {
      groups.set(key, [ad]);
    }
  }

  return Array.from(groups.values())
    .map((group, index) => selectAd(group, seed + index))
    .filter((ad): ad is AdCreative => Boolean(ad));
}

export function excludeConflictingAds(
  ads: AdCreative[] | undefined,
  conflictSponsor?: AdConflictSponsor | null
): AdCreative[] {
  if (!ads?.length) return [];
  if (!conflictSponsor?._id && !conflictSponsor?.businessCategory) return ads;

  return ads.filter((ad) => {
    const sponsor = ad.sponsor;
    if (!sponsor) return false;
    if (conflictSponsor._id && sponsor._id === conflictSponsor._id) return false;
    if (
      conflictSponsor.businessCategory &&
      sponsor.businessCategory === conflictSponsor.businessCategory
    ) {
      return false;
    }
    return true;
  });
}

export function selectAdForPlacement(
  ads: AdCreative[] | undefined,
  placement: AdPlacement,
  slotIndex = 0,
  contextKey?: string,
  seed = rotationSeed()
): AdCreative | null {
  if (!ads?.length) return null;

  const effectiveSlotIndex = slotIndex + seed + contextSeed(contextKey);
  const tiers = TIER_PRIORITY_BY_PLACEMENT[placement];
  for (const tier of tiers) {
    const tierAds = adsForTier(ads, tier);
    if (tierAds.length) return selectAd(sponsorBalancedAds(tierAds, effectiveSlotIndex), effectiveSlotIndex);
  }

  return selectAd(sponsorBalancedAds(ads, effectiveSlotIndex), effectiveSlotIndex);
}

export function profileAdPlacementForSlot(slotIndex: number): AdPlacement {
  return slotIndex >= 2 ? "profilePartner" : "profileFounder";
}

export function adPlacementForArticleSection(section?: string): AdPlacement {
  switch (section) {
    case "news":
      return "newsFeed";
    case "data-insights":
      return "data";
    default:
      return "standardArticle";
  }
}

export function adPlacementForSurface(surface: AdSurface): AdPlacement {
  switch (surface) {
    case "homepage":
      return "homepageSponsor";
    case "memberProfile":
    case "projectProfile":
      return "profileFounder";
    case "news":
      return "newsFeed";
    case "data":
      return "data";
    case "insights":
      return "insights";
    default:
      return "standardArticle";
  }
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
