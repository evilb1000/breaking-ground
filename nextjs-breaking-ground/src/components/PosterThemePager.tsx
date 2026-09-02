"use client"

import Link from "next/link"
import {cyclePosterTheme, getPosterTheme, listPosterThemes} from "@/lib/dataPosters"

export default function PosterThemePager({
  typeId,
  themeSlug,
  href,
}: {
  typeId: string
  themeSlug?: string
  href: string
}) {
  const current = getPosterTheme(typeId, themeSlug)
  const themes = listPosterThemes(typeId)
  const prev = cyclePosterTheme(typeId, current.slug, -1)
  const next = cyclePosterTheme(typeId, current.slug, 1)

  return (
    <div className="bg-font-roboto mb-6 flex flex-wrap items-center justify-between gap-3 text-[13px]">
      <Link
        href={`${href}?theme=${prev.slug}`}
        className="text-[#1d1b20] underline underline-offset-2"
      >
        ← {prev.name}
      </Link>
      <p className="text-center">
        <span className="block text-[10px] font-bold tracking-[0.14em] text-[#373632a6] uppercase">
          {typeId}
        </span>
        <span className="font-semibold">{current.name}</span>
      </p>
      <Link
        href={`${href}?theme=${next.slug}`}
        className="text-[#1d1b20] underline underline-offset-2"
      >
        {next.name} →
      </Link>
      <div className="flex w-full flex-wrap justify-center gap-2 text-[11px]">
        {themes.map((theme) => (
          <Link
            key={theme.slug}
            href={`${href}?theme=${theme.slug}`}
            className={theme.slug === current.slug ? "font-bold" : "text-[#373632a6]"}
          >
            {theme.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
