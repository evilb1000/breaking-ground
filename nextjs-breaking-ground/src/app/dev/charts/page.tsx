import type {Metadata} from "next"
import Link from "next/link"
import {listPosterTypes} from "@/lib/dataPosters"
import {getActivePosterDataset} from "@/lib/posterData.server"
import {assertLocalPosterWorkshop} from "@/lib/posterWorkshop"

export const metadata: Metadata = {
  title: "Data poster creator",
  robots: {index: false, follow: false},
}

export default function DataPosterCreatorPage() {
  assertLocalPosterWorkshop()
  const types = listPosterTypes()

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto w-full max-w-[686px] px-5 py-12">
        <h1
          className="bg-font-roboto-flex text-[28px] leading-[34px]"
          style={{fontWeight: 838}}
        >
          Data poster creator
        </h1>
        <p className="bg-article-body mt-4">
          Drop a CSV on the repo root or in <code>data_posters/inbox/</code>, then run{" "}
          <code>node data_posters/ingest.mjs</code>. This page reads whatever{" "}
          <code>data_posters/active.json</code> points at.
        </p>
        <ul className="mt-8 flex flex-col gap-6">
          {types.map((type) => {
            const active = getActivePosterDataset(type.id)
            return (
              <li key={type.id} className="border-t border-[#e6e2dc] pt-4">
                <p className="bg-font-roboto text-[11px] font-bold tracking-[0.14em] uppercase text-[#373632a6]">
                  {type.id}
                </p>
                <h2 className="bg-font-roboto-flex mt-1 text-[22px] leading-[26px]" style={{fontWeight: 700}}>
                  {type.name}
                </h2>
                <p className="mt-2 text-[14px] text-[#373632]">
                  Active: {active?.label || "none"}{" "}
                  {active?.source ? `(${active.source})` : ""}
                </p>
                <p className="mt-3 flex flex-wrap gap-3 text-[14px]">
                  <Link className="underline underline-offset-2" href={`/dev/charts/${type.id}`}>
                    Open poster
                  </Link>
                  {type.themes.map((slug) => (
                    <Link
                      key={slug}
                      className="underline underline-offset-2"
                      href={`/dev/charts/${type.id}?theme=${slug}`}
                    >
                      {slug}
                    </Link>
                  ))}
                </p>
              </li>
            )
          })}
        </ul>
      </article>
    </main>
  )
}
