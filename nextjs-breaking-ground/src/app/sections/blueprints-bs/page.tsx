import type { Metadata } from "next"
import Link from "next/link"
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon"
import HomepageEventBanner from "@/components/homepage/HomepageEventBanner"
import PodcastArchive from "@/components/podcast/PodcastArchive"
import { getAdsForSurface } from "@/lib/ads"
import { getHomepageEventBannerProps } from "@/lib/homepageEvent"
import { loadPodcastEpisodes, PODCAST_REVALIDATE_SECONDS } from "@/lib/youtubePodcast"

export const revalidate = PODCAST_REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: "Blueprints&BS",
  description: "Western Pennsylvania's premiere podcast for construction news and gossip.",
}

export default async function BlueprintsPodcastPage() {
  const [episodes, eventBanner, ads] = await Promise.all([
    loadPodcastEpisodes().catch((error) => {
      console.error("Could not load the Blueprints&BS playlist.", error)
      return []
    }),
    getHomepageEventBannerProps(),
    getAdsForSurface("news"),
  ])

  return (
    <main className="min-h-screen bg-white text-[#312e28]">
      <HomepageTopRibbon />

      <section className="relative border-b border-[#2d567b] bg-[#285a8a]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.2))]" />
        <div className="relative mx-auto flex h-[96px] w-full max-w-[1440px] items-end px-[20px] pb-[18px] text-white lg:h-[148px] lg:px-6 lg:pb-6">
          <div className="mx-auto w-full max-w-[922px] text-left lg:text-right">
            <p className="bg-font-roboto text-[14px] leading-[18px]">
              <Link href="/" className="underline">
                Home
              </Link>{" "}
              / <span className="text-white/70">Blueprints&amp;BS</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[922px] px-[20px] pb-[56px] pt-[32px] lg:px-0 lg:pb-[72px] lg:pt-[40px]">
        <PodcastArchive episodes={episodes} ads={ads} />
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-[26px]">
        <HomepageEventBanner {...eventBanner} />
      </div>
    </main>
  )
}
