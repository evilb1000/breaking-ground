import type {CSSProperties} from "react"
import catalog from "@/data/posters/catalog.json"
import coolMidnight from "@/data/posters/themes/cool-midnight.json"
import cozyCottage from "@/data/posters/themes/cozy-cottage.json"
import harborFog from "@/data/posters/themes/harbor-fog.json"
import signalCyan from "@/data/posters/themes/signal-cyan.json"
import nightCircuit from "@/data/posters/themes/night-circuit.json"
import coolMidnightBars from "@/data/posters/themes/cool-midnight-bars.json"

export type PosterScaleStop = [number, [number, number, number]]

export type PosterThemeTokens = {
  bg: string
  ink: string
  muted: string
  accent: string
  title: string
  label: string
  y1: string
  y2: string
  y3: string
  emptyCell: string
  emptyText: string
  cellTextLight: string
  cellTextDark: string
  track: string
  border: string
  ring: string
  glowA: string
  glowB: string
  washA: string
  washB: string
  titleGlow: string
  kpiGlowA: string
  kpiGlowB: string
  heatRgb: string
  scale: string
}

export type PosterTheme = {
  slug: string
  name: string
  type: string
  tokens: PosterThemeTokens
  scale: PosterScaleStop[]
  series?: Record<string, string>
}

export type PosterTypeMeta = {
  id: string
  name: string
  chartType: string
  defaultTheme: string
  themes: string[]
}

const THEMES: PosterTheme[] = [coolMidnight, cozyCottage, harborFog, signalCyan, nightCircuit, coolMidnightBars] as PosterTheme[]

export const POSTER_CATALOG = catalog as {version: number; types: PosterTypeMeta[]}

export function listPosterTypes(): PosterTypeMeta[] {
  return POSTER_CATALOG.types
}

export function getPosterType(typeId: string): PosterTypeMeta | undefined {
  return POSTER_CATALOG.types.find((entry) => entry.id === typeId)
}

export function listPosterThemes(typeId: string): PosterTheme[] {
  const type = getPosterType(typeId)
  if (!type) return []
  return type.themes
    .map((slug) => THEMES.find((theme) => theme.slug === slug && theme.type === typeId))
    .filter((theme): theme is PosterTheme => Boolean(theme))
}

export function getPosterTheme(typeId: string, slug?: string | null): PosterTheme {
  const type = getPosterType(typeId)
  const themes = listPosterThemes(typeId)
  const wanted = slug || type?.defaultTheme
  return themes.find((theme) => theme.slug === wanted) || themes[0] || (coolMidnight as PosterTheme)
}

export function cyclePosterTheme(typeId: string, slug: string | undefined, direction: 1 | -1): PosterTheme {
  const themes = listPosterThemes(typeId)
  const current = getPosterTheme(typeId, slug)
  const index = Math.max(0, themes.findIndex((theme) => theme.slug === current.slug))
  return themes[(index + direction + themes.length) % themes.length] || current
}

export function posterThemeStyle(theme: PosterTheme): CSSProperties {
  const t = theme.tokens
  return {
    ["--hr-bg" as string]: t.bg,
    ["--hr-ink" as string]: t.ink,
    ["--hr-muted" as string]: t.muted,
    ["--hr-gold" as string]: t.accent,
    ["--hr-title" as string]: t.title,
    ["--hr-label" as string]: t.label,
    ["--hr-y1" as string]: t.y1,
    ["--hr-y2" as string]: t.y2,
    ["--hr-y3" as string]: t.y3,
    ["--hr-empty-cell" as string]: t.emptyCell,
    ["--hr-empty-text" as string]: t.emptyText,
    ["--hr-track" as string]: t.track,
    ["--hr-border" as string]: t.border,
    ["--hr-ring" as string]: t.ring,
    ["--hr-glow-a" as string]: t.glowA,
    ["--hr-glow-b" as string]: t.glowB,
    ["--hr-wash-a" as string]: t.washA,
    ["--hr-wash-b" as string]: t.washB,
    ["--hr-title-glow" as string]: t.titleGlow,
    ["--hr-kpi-glow-a" as string]: t.kpiGlowA,
    ["--hr-kpi-glow-b" as string]: t.kpiGlowB,
    ["--hr-heat-rgb" as string]: t.heatRgb,
    ["--hr-scale" as string]: t.scale,
  } as CSSProperties
}

export function interpolatePosterScale(scale: PosterScaleStop[], t: number): string {
  const x = Math.min(1, Math.max(0, t))
  if (!scale.length) return "rgb(0,0,0)"
  let i = 0
  while (i < scale.length - 2 && scale[i + 1][0] < x) i += 1
  const [t0, c0] = scale[i]
  const [t1, c1] = scale[Math.min(i + 1, scale.length - 1)]
  const u = (x - t0) / (t1 - t0 || 1)
  const mix = (a: number, b: number) => Math.round(a + (b - a) * u)
  return `rgb(${mix(c0[0], c1[0])},${mix(c0[1], c1[1])},${mix(c0[2], c1[2])})`
}

export const SANITY_POSTER_THEME_OPTIONS = POSTER_CATALOG.types.flatMap((type) =>
  listPosterThemes(type.id).map((theme) => ({
    title: theme.name,
    value: theme.slug,
  })),
)
