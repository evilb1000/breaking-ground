"use client"

import { Fragment, useMemo, useState } from "react"
import InsightsAdUnit from "@/components/insights/InsightsAdUnit"
import { selectAdForPlacement, type AdCreative } from "@/lib/ads"
import type { PodcastEpisode } from "@/lib/youtubePodcast"

const PAGE_SIZE = 8
const SPOTIFY_URL = "https://open.spotify.com/show/6YjxYBZvxGMplqUPpGfgWC"

const HEADING_STYLE = {
  fontVariationSettings:
    "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
  fontWeight: 838,
} as const

function formatEpisodeDate(raw?: string): string {
  if (!raw) return ""
  const dt = new Date(raw)
  if (Number.isNaN(dt.getTime())) return ""
  return dt
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase()
}

function preview(description: string): string {
  const clean = description.replace(/\s+/g, " ").trim()
  if (clean.length <= 220) return clean
  return `${clean.slice(0, 217).trim()}…`
}

function EpisodePlayer({ id, title }: { id: string; title: string }) {
  return (
    <iframe
      className="h-full w-full"
      src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  )
}

function EpisodeMedia({
  episode,
  playing,
  onPlay,
}: {
  episode: PodcastEpisode
  playing: boolean
  onPlay: () => void
}) {
  if (playing) {
    return (
      <div className="aspect-video overflow-hidden rounded-[4px] bg-[#113251]">
        <EpisodePlayer id={episode.id} title={episode.title} />
      </div>
    )
  }

  return (
    <button type="button" onClick={onPlay} className="group block w-full text-left">
      <div className="aspect-video overflow-hidden rounded-[4px] bg-[#f5f3f0]">
        <img
          src={episode.thumbnail}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
    </button>
  )
}

export default function PodcastArchive({
  episodes,
  ads,
}: {
  episodes: PodcastEpisode[]
  ads: AdCreative[]
}) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const featured = episodes[0]

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return episodes
    return episodes.filter((episode) => {
      const haystack = `${episode.title} ${episode.description}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [episodes, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function play(id: string) {
    setPlayingId(id)
  }

  return (
    <>
      <h1 className="bg-type-h1 text-[#312e28]">Blueprints&amp;BS</h1>
      <p className="mt-[16px] max-w-[640px] bg-type-body text-[#312e28]">
        Western Pennsylvania&rsquo;s premiere podcast for construction news and gossip.
      </p>
      <a
        href={SPOTIFY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-[24px] inline-flex items-center justify-center rounded-[4px] bg-[#113251] px-[16px] py-[12px] bg-font-roboto text-[12px] font-bold text-white"
      >
        Listen on Spotify
      </a>

      {featured ? (
        <article id="podcast-player" className="mt-[32px] scroll-mt-[24px] lg:mt-[48px] lg:grid lg:grid-cols-[476px_1fr] lg:gap-[20px]">
          <EpisodeMedia
            episode={featured}
            playing={playingId === featured.id}
            onPlay={() => setPlayingId(featured.id)}
          />
          <div className="mt-[16px] flex flex-col justify-center rounded-[4px] bg-[#f5f3f0] px-[20px] py-[24px] lg:mt-0 lg:px-[24px]">
            <p className="bg-type-meta text-[#312e28]">Latest episode</p>
            <h2 className="bg-font-roboto-flex mt-[8px] text-[22px] leading-[26px] text-[#312e28] lg:text-[28px] lg:leading-[34px]" style={HEADING_STYLE}>
              {featured.title}
            </h2>
            {featured.publishedAt ? (
              <p className="bg-type-meta mt-[12px] text-[#312e28]">{formatEpisodeDate(featured.publishedAt)}</p>
            ) : null}
            {featured.description ? (
              <p className="mt-[16px] bg-font-crimson text-[14px] leading-[20px] text-[#312e28] lg:text-[16px] lg:leading-[22px]">
                {preview(featured.description)}
              </p>
            ) : null}
            {playingId === featured.id ? null : (
              <button
                type="button"
                onClick={() => setPlayingId(featured.id)}
                className="mt-[20px] inline-flex w-full items-center justify-center rounded-[4px] bg-[#113251] p-[12px] bg-font-roboto text-[12px] font-bold text-white lg:w-[156px]"
              >
                Watch episode
              </button>
            )}
          </div>
        </article>
      ) : (
        <p className="mt-[32px] bg-type-body text-[#312e28]">
          New episodes will show up here after the next refresh.
        </p>
      )}

      <div className="mt-[40px] lg:mt-[48px]">
        <div className="flex flex-col gap-[16px] sm:flex-row sm:items-end sm:justify-between">
          <h2 className="bg-font-roboto-flex text-[22px] leading-[26px] text-[#312e28] lg:text-[28px] lg:leading-[34px]" style={HEADING_STYLE}>
            All episodes
          </h2>
          <form
            role="search"
            className="w-full sm:w-[280px]"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="episode-search" className="bg-type-meta text-[#312e28]">
              Search episodes
            </label>
            <input
              id="episode-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Title or guest"
              className="mt-[6px] w-full rounded-[4px] border border-[#d8d8d8] bg-white px-[12px] py-[10px] bg-font-roboto text-[14px] text-[#312e28] outline-none focus:border-[#113251]"
            />
          </form>
        </div>

        {visible.length === 0 ? (
          <p className="mt-[24px] bg-type-body text-[#312e28]">No episodes match that search.</p>
        ) : (
          <div className="mt-[24px] flex flex-col divide-y divide-[#312e28]/25 border-y-2 border-[#312e28]/25">
            {visible.map((episode, i) => (
              <Fragment key={episode.id}>
                <article className="py-[26px] lg:py-[34px]">
                  <EpisodeMedia
                    episode={episode}
                    playing={playingId === episode.id}
                    onPlay={() => play(episode.id)}
                  />
                  <div className="mt-[16px] flex flex-col gap-[5px]">
                    {episode.publishedAt ? (
                      <p className="bg-type-meta text-[#312e28]">{formatEpisodeDate(episode.publishedAt)}</p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => play(episode.id)}
                      className="bg-font-roboto-condensed text-left text-[16px] font-medium leading-[22px] text-[#312e28] hover:underline lg:text-[20px] lg:leading-[26px]"
                    >
                      {episode.title}
                    </button>
                  </div>
                </article>
                {i % 2 === 0 ? (
                  <div className="py-[8px] lg:py-0">
                    <InsightsAdUnit
                      ad={selectAdForPlacement(ads, "newsFeed", Math.floor(i / 2), `podcast-page:${currentPage}`)}
                    />
                  </div>
                ) : null}
              </Fragment>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav className="mt-[28px] flex items-center gap-[10px]" aria-label="Episode pages">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="inline-flex items-center justify-center rounded-[4px] border border-[#113251]/30 px-[12px] py-[6px] bg-font-roboto text-[14px] text-[#113251] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <p className="bg-font-roboto text-[14px] text-[#312e28]">
              {currentPage} of {totalPages}
            </p>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="inline-flex items-center justify-center rounded-[4px] border border-[#113251]/30 px-[12px] py-[6px] bg-font-roboto text-[14px] text-[#113251] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        ) : null}
      </div>
    </>
  )
}
