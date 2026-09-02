import fs from "node:fs"
import path from "node:path"

export type ActivePosterDataset = {
  id: string
  label: string
  path: string
  source: string
  ingestedAt: string | null
  typeId: string
  warnings: string[]
}

function postersRoot() {
  return path.resolve(process.cwd(), "..", "..", "data_posters")
}

export function getActivePosterDataset(typeId: string): ActivePosterDataset | null {
  const activePath = path.join(postersRoot(), "active.json")
  if (!fs.existsSync(activePath)) return null
  const active = JSON.parse(fs.readFileSync(activePath, "utf8")) as Record<string, ActivePosterDataset>
  return active[typeId] || null
}

export function resolveActivePosterCsv(typeId: string): {
  absPath: string
  dataset: ActivePosterDataset | null
} {
  const dataset = getActivePosterDataset(typeId)
  const fallback = path.join(
    postersRoot(),
    "types",
    typeId,
    "samples",
    "pittsburgh_submarket_price_per_unit_3yr.csv",
  )
  const rel = dataset?.path
  const absPath = rel ? path.join(postersRoot(), rel) : fallback
  return {
    absPath: fs.existsSync(absPath) ? absPath : fallback,
    dataset,
  }
}

export function parsePosterCsv(text: string): Array<Record<string, string>> {
  const lines = text.trim().split(/\r?\n/)
  const headers = lines[0]?.split(",")?.map((h) => h.trim()) || []
  return lines.slice(1).map((line) => {
    const cols = line.split(",")
    const row: Record<string, string> = {}
    headers.forEach((header, i) => {
      row[header] = (cols[i] ?? "").trim()
    })
    return row
  })
}

export function loadActivePosterRows(typeId: string) {
  const {absPath, dataset} = resolveActivePosterCsv(typeId)
  const rows = parsePosterCsv(fs.readFileSync(absPath, "utf8"))
  return {rows, dataset, absPath}
}
