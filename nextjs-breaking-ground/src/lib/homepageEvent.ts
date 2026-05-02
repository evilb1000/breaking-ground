import type {HomepageEventBannerProps} from "@/components/homepage/HomepageEventBanner";
import {client} from "@/sanity/client";

type HomepageEventSource = {
  title?: string | null;
  publishedAt?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  backgroundImageSrc?: string | null;
} | null;

const HOMEPAGE_EVENT_QUERY = `*[_type == "updatedHomepage"] | order(_updatedAt desc)[0]{
  "title": coalesce(tertiaryFeature->headline, tertiaryFeature->title, issueHighlight->headline, issueHighlight->title),
  "publishedAt": coalesce(tertiaryFeature->publishedAt, issueHighlight->publishedAt),
  "body": announcementMessage,
  "ctaLabel": announcementLinkLabel,
  "ctaHref": announcementLinkUrl,
  "backgroundImageSrc": coalesce(
    tertiaryFeature->homepageImage.asset->url,
    tertiaryFeature->headerImage.asset->url,
    tertiaryFeature->heroImage.asset->url,
    tertiaryFeature->introImage.asset->url,
    issueHighlight->homepageImage.asset->url,
    issueHighlight->headerImage.asset->url,
    issueHighlight->heroImage.asset->url,
    issueHighlight->introImage.asset->url
  )
}`;

const options = {next: {revalidate: 0}};

function formatEventSubtitle(raw?: string | null) {
  if (!raw) return null;
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return null;
  return `Event date ${dt.toLocaleDateString("en-US").replaceAll("/", ".")}`;
}

export async function getHomepageEventBannerProps(): Promise<HomepageEventBannerProps> {
  const homepageEvent = await client.fetch<HomepageEventSource>(HOMEPAGE_EVENT_QUERY, {}, options);

  return {
    title: homepageEvent?.title,
    subtitle: formatEventSubtitle(homepageEvent?.publishedAt),
    body: homepageEvent?.body,
    ctaLabel: homepageEvent?.ctaLabel,
    ctaHref: homepageEvent?.ctaHref,
    backgroundImageSrc: homepageEvent?.backgroundImageSrc,
  };
}
