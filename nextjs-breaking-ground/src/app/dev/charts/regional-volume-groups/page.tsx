import type {Metadata} from "next"
import RegionalVolumeGroupsChartAnimated from "@/components/RegionalVolumeGroupsChartAnimated"
import PosterThemePager from "@/components/PosterThemePager"
import {getPosterTheme} from "@/lib/dataPosters"
import {loadActivePosterRows} from "@/lib/posterData.server"
import {assertLocalPosterWorkshop} from "@/lib/posterWorkshop"

export const metadata: Metadata = {
  title: "Regional volume groups preview",
  robots: {index: false, follow: false},
}

export default async function RegionalVolumeGroupsPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{theme?: string}>
}) {
  assertLocalPosterWorkshop()
  const {theme: themeSlug} = await searchParams
  const theme = getPosterTheme("regional-volume-groups", themeSlug)
  const {rows, dataset} = loadActivePosterRows("regional-volume-groups")

  return (
    <main className="min-h-screen max-w-[100vw] overflow-x-hidden bg-white">
      <article className="mx-auto w-full min-w-0 max-w-[686px] overflow-x-hidden px-5 py-12">
        <PosterThemePager
          typeId="regional-volume-groups"
          themeSlug={theme.slug}
          href="/dev/charts/regional-volume-groups"
        />
        <div className="bg-article-body break-words">
          <p>
            Active extract: <strong>{dataset?.label || "sample"}</strong>
            {dataset?.source === "ingest" ? " (from ingest pipeline)" : " (bundled sample)"}.
            Theme: {theme.name}
            {dataset?.rootName ? (
              <>
                . Root name: <code>{dataset.rootName}</code>
              </>
            ) : null}
            .
          </p>
        </div>
        <RegionalVolumeGroupsChartAnimated data={rows} duration={1800} theme={theme.slug} />
        <p className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
          Word docs insert this poster with{" "}
          <code>{`{{chart:${dataset?.rootName || "national_region_annual_trends"}}}`}</code>.
        </p>
      </article>
    </main>
  )
}
