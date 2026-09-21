import fs from "node:fs"
import path from "node:path"

export type ActivePosterDataset = {
  id: string
  label: string
  rootName?: string
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
  const sampleDir = path.join(postersRoot(), "types", typeId, "samples")
  const sampleName = fs.existsSync(sampleDir)
    ? fs.readdirSync(sampleDir).find((name) => name.toLowerCase().endsWith(".csv"))
    : null
  const fallback = sampleName ? path.join(sampleDir, sampleName) : ""
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

function findIngestedByRoot(typeId: string, rootName: string): ActivePosterDataset | null {
  const ingested = path.join(postersRoot(), "ingested", typeId)
  if (!fs.existsSync(ingested)) return null
  const dirs = fs.readdirSync(ingested).sort().reverse()
  for (const name of dirs) {
    const metaPath = path.join(ingested, name, "meta.json")
    if (!fs.existsSync(metaPath)) continue
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {rootName?: string; paths?: {mapped?: string}; label?: string; ingestedAt?: string; warnings?: string[]}
    if (meta.rootName !== rootName) continue
    return {
      id: name,
      label: meta.label || rootName,
      rootName,
      path: meta.paths?.mapped || path.join("ingested", typeId, name, "mapped.csv"),
      source: "ingest",
      ingestedAt: meta.ingestedAt || null,
      typeId,
      warnings: meta.warnings || [],
    }
  }
  const sample = path.join(postersRoot(), "types", typeId, "samples", `${rootName}.csv`)
  if (!fs.existsSync(sample)) return null
  return {
    id: rootName,
    label: `${rootName}.csv`,
    rootName,
    path: path.relative(postersRoot(), sample),
    source: "sample",
    ingestedAt: null,
    typeId,
    warnings: [],
  }
}

export function loadActivePosterRows(typeId: string, rootName?: string) {
  const override = rootName ? findIngestedByRoot(typeId, rootName) : null
  const resolved = resolveActivePosterCsv(typeId)
  const dataset = override || resolved.dataset
  const absPath = override ? path.join(postersRoot(), override.path) : resolved.absPath
  const rows = parsePosterCsv(fs.readFileSync(absPath, "utf8"))
  return {rows, dataset, absPath}
}
