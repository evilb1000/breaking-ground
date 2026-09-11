import type {Metadata} from "next"
import NationalVolumeBarsChartAnimated from "@/components/NationalVolumeBarsChartAnimated"
import PosterThemePager from "@/components/PosterThemePager"
import {getPosterTheme} from "@/lib/dataPosters"
import {loadActivePosterRows} from "@/lib/posterData.server"
import {assertLocalPosterWorkshop} from "@/lib/posterWorkshop"

export const metadata: Metadata = {
  title: "National volume bars preview",
  robots: {index: false, follow: false},
}

export default async function NationalVolumeBarsPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{theme?: string}>
}) {
  assertLocalPosterWorkshop()
  const {theme: themeSlug} = await searchParams
  const theme = getPosterTheme("national-volume-bars", themeSlug)
  const {rows, dataset} = loadActivePosterRows("national-volume-bars")

  return (
    <main className="min-h-screen max-w-[100vw] overflow-x-hidden bg-white">
      <article className="mx-auto w-full min-w-0 max-w-[686px] px-5 py-12 overflow-x-hidden">
        <PosterThemePager
          typeId="national-volume-bars"
          themeSlug={theme.slug}
          href="/dev/charts/national-volume-bars"
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
        <NationalVolumeBarsChartAnimated data={rows} duration={1800} theme={theme.slug} />
        {dataset?.warnings?.length ? (
          <p className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
            {dataset.warnings.join(" ")}
          </p>
        ) : (
          <p className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
            Word docs insert this poster with <code>{"{{chart:national_industrial_five_year_history}}"}</code>.
          </p>
        )}
      </article>
    </main>
  )
}
