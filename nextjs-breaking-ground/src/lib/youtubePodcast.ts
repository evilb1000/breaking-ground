/**
 * Blueprints&BS episodes come from the public YouTube playlist feed.
 * That feed returns the latest 15 episodes and needs no API key.
 * The page keeps that cap on purpose.
 */

export type PodcastEpisode = {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnail: string
}

export const PODCAST_PLAYLIST_ID = "PLQQFGLSYIMfc"
const EPISODE_CAP = 15

const RSS_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PODCAST_PLAYLIST_ID}`

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim()
}

function thumbnailFor(videoId: string, fromFeed?: string): string {
  return fromFeed || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

function byNewest(a: PodcastEpisode, b: PodcastEpisode): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
}

function parseRss(xml: string): PodcastEpisode[] {
  const episodes: PodcastEpisode[] = []
  for (const entry of xml.split("<entry>").slice(1)) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim()
    if (!id) continue
    const title = decodeXml(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "")
    if (!title || title === "Private video" || title === "Deleted video") continue
    const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1]?.trim() || ""
    const description = decodeXml(
      entry.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || "",
    )
    const thumbnail = entry.match(/<media:thumbnail url="([^"]+)"/)?.[1]
    episodes.push({
      id,
      title,
      description,
      publishedAt,
      thumbnail: thumbnailFor(id, thumbnail),
    })
  }
  return episodes.sort(byNewest).slice(0, EPISODE_CAP)
}

export async function loadPodcastEpisodes(): Promise<PodcastEpisode[]> {
  const response = await fetch(RSS_URL, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`YouTube RSS request failed (${response.status})`)
  }
  return parseRss(await response.text())
}
