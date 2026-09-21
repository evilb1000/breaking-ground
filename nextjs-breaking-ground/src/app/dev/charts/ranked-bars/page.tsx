import type {Metadata} from "next"
import RankedBarsChartAnimated from "@/components/RankedBarsChartAnimated"
import PosterThemePager from "@/components/PosterThemePager"
import {getAutumnPosterCopy} from "@/lib/autumnPosterCopy"
import {getPosterTheme} from "@/lib/dataPosters"
import {loadActivePosterRows} from "@/lib/posterData.server"
import {assertLocalPosterWorkshop} from "@/lib/posterWorkshop"

export const metadata: Metadata = {
  title: "Ranked bars preview",
  robots: {index: false, follow: false},
}

export default async function RankedBarsPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{theme?: string; root?: string}>
}) {
  assertLocalPosterWorkshop()
  const {theme: themeSlug, root} = await searchParams
  const theme = getPosterTheme("ranked-bars", themeSlug)
  const {rows, dataset} = loadActivePosterRows("ranked-bars", root)
  const copy = getAutumnPosterCopy(dataset?.rootName || root)

  return (
    <main className="min-h-screen max-w-[100vw] overflow-x-hidden bg-white">
      <article className="mx-auto w-full min-w-0 max-w-[686px] overflow-x-hidden px-5 py-12">
        <PosterThemePager typeId="ranked-bars" themeSlug={theme.slug} href="/dev/charts/ranked-bars" />
        <div className="bg-article-body break-words">
          <p>
            Active extract: <strong>{dataset?.label || "sample"}</strong>
            {dataset?.source === "ingest" ? " (from ingest pipeline)" : " (bundled sample)"}. Theme: {theme.name}
            {dataset?.rootName ? (
              <>
                . Root name: <code>{dataset.rootName}</code>
              </>
            ) : null}
            .
          </p>
          <p className="mt-2 text-[13px]">
            <a className="underline" href="/dev/charts/ranked-bars?root=washington_county_oldest_municipalities">
              Oldest municipalities
            </a>
            {" · "}
            <a className="underline" href="/dev/charts/ranked-bars?root=washington_county_employment_industries">
              Employment
            </a>
          </p>
        </div>
        <RankedBarsChartAnimated
          data={rows}
          theme={theme.slug}
          chartTitle={copy?.chartTitle}
          xLabel={copy?.xLabel}
          yLabel={copy?.yLabel}
          caption={copy?.caption}
        />
        <p className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
          Word docs insert this poster with <code>{`{{chart:${dataset?.rootName || "root_name"}}}`}</code>.
        </p>
      </article>
    </main>
  )
}
