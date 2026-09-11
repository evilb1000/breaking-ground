import type {Metadata} from "next"
import RollingAverageLineChartAnimated from "@/components/RollingAverageLineChartAnimated"
import PosterThemePager from "@/components/PosterThemePager"
import {getPosterTheme} from "@/lib/dataPosters"
import {loadActivePosterRows} from "@/lib/posterData.server"
import {assertLocalPosterWorkshop} from "@/lib/posterWorkshop"
import {getRollingAverageCopy} from "@/lib/rollingAverageCopy"

export const metadata: Metadata = {
  title: "Rolling average line preview",
  robots: {index: false, follow: false},
}

export default async function RollingAverageLinePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{theme?: string}>
}) {
  assertLocalPosterWorkshop()
  const {theme: themeSlug} = await searchParams
  const theme = getPosterTheme("rolling-average-line", themeSlug)
  const {rows, dataset} = loadActivePosterRows("rolling-average-line")
  const copy = getRollingAverageCopy(dataset?.rootName)

  return (
    <main className="min-h-screen max-w-[100vw] overflow-x-hidden bg-white">
      <article className="mx-auto w-full min-w-0 max-w-[686px] overflow-x-hidden px-5 py-12">
        <PosterThemePager
          typeId="rolling-average-line"
          themeSlug={theme.slug}
          href="/dev/charts/rolling-average-line"
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
        <RollingAverageLineChartAnimated
          data={rows}
          duration={1800}
          theme={theme.slug}
          chartTitle={copy?.chartTitle}
          xLabel={copy?.xLabel}
          yLabel={copy?.yLabel}
        />
        <p className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
          Word docs insert this poster with{" "}
          <code>{`{{chart:${dataset?.rootName || "root_name"}}}`}</code>.
        </p>
      </article>
    </main>
  )
}
