import type {Metadata} from "next"
import HeatmapRangeChartAnimated from "@/components/HeatmapRangeChartAnimated"
import PosterThemePager from "@/components/PosterThemePager"
import {getPosterTheme} from "@/lib/dataPosters"
import {loadActivePosterRows} from "@/lib/posterData.server"
import {assertLocalPosterWorkshop} from "@/lib/posterWorkshop"

export const metadata: Metadata = {
  title: "Heatmap + Range chart preview",
  robots: {index: false, follow: false},
}

export default async function HeatmapRangePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{theme?: string}>
}) {
  assertLocalPosterWorkshop()
  const {theme: themeSlug} = await searchParams
  const theme = getPosterTheme("heatmap-range", themeSlug)
  const {rows, dataset} = loadActivePosterRows("heatmap-range")

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto w-full max-w-[686px] px-5 py-12">
        <PosterThemePager
          typeId="heatmap-range"
          themeSlug={theme.slug}
          href="/dev/charts/heatmap-range"
        />
        <div className="bg-article-body">
          <p>
            Active extract: <strong>{dataset?.label || "sample"}</strong>
            {dataset?.source === "ingest" ? " (from ingest pipeline)" : " (bundled sample)"}.
            Theme: {theme.name}.
          </p>
        </div>
        <HeatmapRangeChartAnimated
          data={rows}
          xField="submarket"
          duration={2200}
          theme={theme.slug}
        />
        {dataset?.warnings?.length ? (
          <p className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
            {dataset.warnings.join(" ")}
          </p>
        ) : (
          <p className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
            Drop a CSV on the repo root and run <code>node data_posters/ingest.mjs</code> to swap this data.
          </p>
        )}
      </article>
    </main>
  )
}
