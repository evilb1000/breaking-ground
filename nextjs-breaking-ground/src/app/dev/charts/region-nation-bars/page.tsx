import type {Metadata} from "next"
import RegionNationBarsChartAnimated from "@/components/RegionNationBarsChartAnimated"
import PosterThemePager from "@/components/PosterThemePager"
import {getPosterTheme} from "@/lib/dataPosters"
import {loadActivePosterRows} from "@/lib/posterData.server"
import {assertLocalPosterWorkshop} from "@/lib/posterWorkshop"

export const metadata: Metadata = {
  title: "Region + Nation bars preview",
  robots: {index: false, follow: false},
}

export default async function RegionNationBarsPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{theme?: string}>
}) {
  assertLocalPosterWorkshop()
  const {theme: themeSlug} = await searchParams
  const theme = getPosterTheme("region-nation-bars", themeSlug)
  const {rows, dataset} = loadActivePosterRows("region-nation-bars")

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto w-full max-w-[686px] px-5 py-12">
        <PosterThemePager
          typeId="region-nation-bars"
          themeSlug={theme.slug}
          href="/dev/charts/region-nation-bars"
        />
        <div className="bg-article-body">
          <p>
            Active extract: <strong>{dataset?.label || "sample"}</strong>
            {dataset?.source === "ingest" ? " (from ingest pipeline)" : " (bundled sample)"}.
            Theme: {theme.name}.
          </p>
        </div>
        <RegionNationBarsChartAnimated data={rows} duration={1800} theme={theme.slug} />
        {dataset?.warnings?.length ? (
          <p className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
            {dataset.warnings.join(" ")}
          </p>
        ) : (
          <p className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
            Drop regional + national CSVs on the repo root and run <code>node data_posters/ingest.mjs</code>.
          </p>
        )}
      </article>
    </main>
  )
}
