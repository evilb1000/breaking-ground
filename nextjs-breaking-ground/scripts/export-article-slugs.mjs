#!/usr/bin/env node
/**
 * Export every figmaArticle slug from Sanity into config/article-slugs.json.
 *
 * This runs as the `prebuild` step. The generated JSON drives the 301 redirect
 * table in next.config.ts which forwards legacy `/{slug}` URLs to the new
 * canonical `/articles/{slug}` paths.
 *
 * Resilience: if Sanity is unreachable at build time, we keep the last
 * committed manifest rather than failing the build. The last manifest is what
 * will be used to serve redirects, so a Sanity outage during deploy is not a
 * production outage.
 *
 * See breaking-ground/docs/url-migration-plan.md for the larger rollout plan.
 */

import {createClient} from '@sanity/client'
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'config')
const OUT_FILE = path.join(OUT_DIR, 'article-slugs.json')

const client = createClient({
  projectId: 'y9xwdi89',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const QUERY = `*[_type == "figmaArticle" && defined(slug.current) && hideFromSite != true]{
  "slug": slug.current
} | order(slug asc)`

function readExistingManifest() {
  if (!existsSync(OUT_FILE)) return null
  try {
    const raw = readFileSync(OUT_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.slugs)) return parsed
  } catch (err) {
    console.warn(`[export-article-slugs] Failed to read existing manifest: ${err.message}`)
  }
  return null
}

function writeManifest(slugs) {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, {recursive: true})
  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'sanity:figmaArticle',
    slugs,
  }
  writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`)
}

async function main() {
  console.log('[export-article-slugs] Fetching article slugs from Sanity...')
  try {
    const rows = await client.fetch(QUERY)
    const slugs = Array.from(
      new Set(
        rows
          .map((r) => (typeof r?.slug === 'string' ? r.slug.trim() : ''))
          .filter(Boolean),
      ),
    ).sort()
    writeManifest(slugs)
    console.log(`[export-article-slugs] Wrote ${slugs.length} slugs to ${path.relative(ROOT, OUT_FILE)}`)
  } catch (err) {
    console.warn(`[export-article-slugs] Sanity fetch failed: ${err.message}`)
    const existing = readExistingManifest()
    if (existing) {
      console.warn(
        `[export-article-slugs] Falling back to previously committed manifest (${existing.slugs.length} slugs).`,
      )
      return
    }
    console.warn('[export-article-slugs] No existing manifest found; writing empty list.')
    writeManifest([])
  }
}

main().catch((err) => {
  console.error('[export-article-slugs] Unexpected error:', err)
  process.exit(1)
})
