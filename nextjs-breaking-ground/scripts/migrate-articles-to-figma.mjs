#!/usr/bin/env node
/**
 * Migrate `article` documents to `figmaArticle` documents.
 *
 * Phases:
 *   --phase=audit   (default) Read-only. Fetches articles, computes plan, writes JSON report.
 *   --phase=migrate Creates figmaArticle copies AND rewrites all inbound references. Does NOT
 *                   delete original article docs (so you can roll back by deleting new figmaArticles).
 *   --phase=cleanup Deletes original article docs. Run only after verifying the migrate phase.
 *   --phase=all     Runs migrate + cleanup in sequence. Discouraged except for scripted runs.
 *
 * Flags:
 *   --execute       Required to actually write. Without it, the script runs in dry-run mode and
 *                   only writes a JSON plan to scripts/migration-reports/.
 *   --skip-drafts   Skip draft versions (default: drafts are migrated alongside published docs).
 *
 * Required env:
 *   SANITY_WRITE_TOKEN  A Sanity token with Editor or higher permissions.
 *
 * Deterministic IDs:
 *   New figmaArticle docs use the _id `figma-{originalArticleId}`. This makes the mapping
 *   idempotent and reversible, and lets the script rewrite inbound references in one pass
 *   (without needing a second round-trip to discover the new ids).
 */

import {createClient} from '@sanity/client'
import {writeFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = new Set(process.argv.slice(2))
const getArg = (name) => {
  const match = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`))
  return match ? match.slice(name.length + 3) : null
}

const PHASE = getArg('phase') || 'audit'
const EXECUTE = args.has('--execute')
const SKIP_DRAFTS = args.has('--skip-drafts')
const VALID_PHASES = ['audit', 'migrate', 'cleanup', 'all']
if (!VALID_PHASES.includes(PHASE)) {
  console.error(`Unknown --phase=${PHASE}. Valid: ${VALID_PHASES.join(', ')}`)
  process.exit(1)
}

const TOKEN = process.env.SANITY_WRITE_TOKEN
if (EXECUTE && !TOKEN) {
  console.error('SANITY_WRITE_TOKEN env var is required when --execute is passed.')
  process.exit(1)
}

const client = createClient({
  projectId: 'y9xwdi89',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
  perspective: 'raw',
})

const REPORT_DIR = path.resolve(__dirname, 'migration-reports')

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const stripDraft = (id) => (id?.startsWith('drafts.') ? id.slice(7) : id)
const addDraftIfNeeded = (newBaseId, originalId) =>
  originalId?.startsWith('drafts.') ? `drafts.${newBaseId}` : newBaseId

const newIdFor = (originalId) => {
  const base = stripDraft(originalId)
  const newBase = `figma-${base}`
  return addDraftIfNeeded(newBase, originalId)
}

const estimateReadingTime = (blocks) => {
  if (!Array.isArray(blocks)) return 3
  const text = blocks
    .filter((b) => b?._type === 'block' && Array.isArray(b.children))
    .flatMap((b) => b.children.map((c) => c?.text || ''))
    .join(' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

const articleTagFromCategory = (category) => {
  const map = {
    feature: 'FEATURE',
    profile: 'PROFILE',
    news: 'NEWS',
    data_trends: 'DATA & TRENDS',
  }
  return map[category] || 'ARTICLE'
}

const mapIntroImage = (src) => {
  if (!src || typeof src !== 'object') return null
  const asset = src.asset
  if (!asset) return null
  return {
    _type: 'image',
    asset,
    ...(src.hotspot ? {hotspot: src.hotspot} : {}),
    ...(src.crop ? {crop: src.crop} : {}),
    ...(src.alt ? {alt: src.alt} : {}),
    ...(src.caption ? {caption: src.caption} : {}),
  }
}

const pickIntroImage = (art) => {
  // Preference: headerImage (canonical) → homepageImage → legacy heroImage.
  const candidate =
    (art.headerImage?.asset && art.headerImage) ||
    (art.homepageImage?.asset && art.homepageImage) ||
    (art.heroImage?.asset && art.heroImage) ||
    null
  return mapIntroImage(candidate)
}

/* ------------------------------------------------------------------ */
/*  Plan computation                                                   */
/* ------------------------------------------------------------------ */

async function fetchAllArticles() {
  // perspective:'raw' returns both drafts and published, so we de-duplicate.
  const query = `*[_type == "article"]{
    _id,
    _type,
    _rev,
    title,
    slug,
    dek,
    heroLede,
    publishedAt,
    headerImage,
    homepageImage,
    heroImage,
    author,
    "authorDoc": author->{name, bio},
    coAuthors,
    category,
    body,
    readingTime,
    featured,
    section,
    series
  }`
  const all = await client.fetch(query)
  if (SKIP_DRAFTS) {
    return all.filter((a) => !a._id.startsWith('drafts.'))
  }
  // De-duplicate: if both drafts.X and X exist, prefer the draft for migration purposes.
  const byBase = new Map()
  for (const doc of all) {
    const base = stripDraft(doc._id)
    const existing = byBase.get(base)
    if (!existing) byBase.set(base, doc)
    else if (doc._id.startsWith('drafts.')) byBase.set(base, doc)
  }
  return [...byBase.values()]
}

function planRelated(article, allById, section) {
  // Pick 2 most-recent articles in same section (excluding self).
  const peers = [...allById.values()]
    .filter((a) => a._id !== article._id && stripDraft(a._id) !== stripDraft(article._id))
    .filter((a) => a.section === section)
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 2)
  if (peers.length < 2) {
    const extras = [...allById.values()]
      .filter((a) => a._id !== article._id && stripDraft(a._id) !== stripDraft(article._id))
      .filter((a) => !peers.includes(a))
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
      .slice(0, 2 - peers.length)
    peers.push(...extras)
  }
  return peers
}

function planNext(article, allById) {
  // Next article: next-older in same section; fall back to next-older overall.
  const ts = new Date(article.publishedAt || 0).getTime()
  const candidates = [...allById.values()]
    .filter((a) => stripDraft(a._id) !== stripDraft(article._id))
    .filter((a) => new Date(a.publishedAt || 0).getTime() < ts)
  const sameSection = candidates.filter((a) => a.section === article.section)
  const pool = sameSection.length ? sameSection : candidates
  pool.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
  return pool[0] || null
}

function buildFigmaArticleDoc(art, idMap, allById) {
  const newId = idMap.get(art._id)
  const introImage = pickIntroImage(art)
  const authorBio = art.authorDoc?.bio || 'Bio forthcoming.'
  const related = planRelated(art, allById, art.section)
  const next = planNext(art, allById)

  const doc = {
    _id: newId,
    _type: 'figmaArticle',
    slug: art.slug,
    publishedAt: art.publishedAt,
    readingTime: typeof art.readingTime === 'number' ? art.readingTime : estimateReadingTime(art.body),
    section: art.section,
    category: art.category || undefined,
    series: art.series || undefined,
    articleTag: articleTagFromCategory(art.category),
    headline: art.title,
    dek: art.dek || undefined,
    ...(introImage ? {introImage} : {}),
    author: art.author,
    coAuthors: Array.isArray(art.coAuthors) && art.coAuthors.length ? art.coAuthors : undefined,
    authorBio,
    body: art.body || [],
    relatedArticles: related.map((peer, i) => ({
      _type: 'reference',
      _key: `rel_${i}_${stripDraft(peer._id)}`,
      _ref: stripDraft(idMap.get(peer._id) || peer._id),
    })),
    ...(next
      ? {
          nextArticle: {
            _type: 'reference',
            _ref: stripDraft(idMap.get(next._id) || next._id),
          },
        }
      : {}),
  }

  // Strip undefined keys so Sanity doesn't store nulls we don't want.
  for (const key of Object.keys(doc)) {
    if (doc[key] === undefined) delete doc[key]
  }
  return doc
}

/* ------------------------------------------------------------------ */
/*  Inbound-reference rewrite                                          */
/* ------------------------------------------------------------------ */

async function findInboundReferencingDocs(oldIds) {
  // Fetch all docs that reference any of the articles we're migrating.
  // Using references() is the cleanest way to find them.
  const query = `*[references($ids)]{
    _id,
    _type,
    _rev
  }`
  return client.fetch(query, {ids: oldIds})
}

// Returns patches [{id, patch}] needed to rewrite every _ref matching old→new.
function buildReferencePatches(docs, idMap) {
  // We can't cleanly "find and replace" _ref values via client.patch without knowing field paths.
  // Strategy: for each referencing doc, fetch its full body, deep-clone, rewrite refs, then
  // createOrReplace the doc. Simpler than surgical patch paths.
  return docs.map((doc) => ({id: doc._id, rev: doc._rev}))
}

function rewriteRefsDeep(node, idMap) {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map((item) => rewriteRefsDeep(item, idMap))
  const copy = {}
  for (const [k, v] of Object.entries(node)) {
    if (k === '_ref' && typeof v === 'string' && idMap.has(v)) {
      copy[k] = stripDraft(idMap.get(v))
    } else {
      copy[k] = rewriteRefsDeep(v, idMap)
    }
  }
  return copy
}

async function fetchReferencingDocsFull(ids) {
  const query = `*[references($ids)]`
  return client.fetch(query, {ids})
}

/* ------------------------------------------------------------------ */
/*  Report writer                                                      */
/* ------------------------------------------------------------------ */

function writeReport(name, data) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.resolve(REPORT_DIR, `${ts}-${name}.json`)
  writeFileSync(file, JSON.stringify(data, null, 2))
  console.log(`📝 Report written: ${file}`)
  return file
}

/* ------------------------------------------------------------------ */
/*  Phases                                                             */
/* ------------------------------------------------------------------ */

async function phaseMigrate({execute}) {
  console.log(`\n▶  Phase: migrate   |   mode: ${execute ? 'EXECUTE' : 'DRY-RUN'}`)

  const articles = await fetchAllArticles()
  console.log(`   Found ${articles.length} article docs (including drafts${SKIP_DRAFTS ? ' – SKIPPED' : ''}).`)

  const allById = new Map(articles.map((a) => [a._id, a]))
  const idMap = new Map(articles.map((a) => [a._id, newIdFor(a._id)]))

  // Build all new figmaArticle docs
  const newDocs = articles.map((art) => buildFigmaArticleDoc(art, idMap, allById))

  // Find inbound refs (docs that point at our articles)
  const referencing = await fetchReferencingDocsFull(articles.map((a) => stripDraft(a._id)))
  console.log(`   Found ${referencing.length} docs with inbound references to articles.`)

  // Rewrite refs (old article id → new figmaArticle id, stripped of drafts. prefix)
  const rewriteMap = new Map()
  for (const [oldId, newId] of idMap.entries()) {
    rewriteMap.set(stripDraft(oldId), stripDraft(newId))
  }
  const rewritten = referencing.map((doc) => rewriteRefsDeep(doc, rewriteMap))

  // Build report
  const report = {
    phase: 'migrate',
    mode: execute ? 'EXECUTE' : 'DRY-RUN',
    counts: {
      articles: articles.length,
      figmaArticlesToCreate: newDocs.length,
      inboundRefDocsToRewrite: referencing.length,
    },
    idMap: [...idMap.entries()].map(([o, n]) => ({old: o, new: n})),
    sampleFigmaArticles: newDocs.slice(0, 3),
    sampleRewrittenRefDocs: rewritten.slice(0, 3).map((d) => ({_id: d._id, _type: d._type})),
  }
  writeReport('migrate-plan', report)

  if (!execute) {
    console.log(`   Dry-run complete. Inspect the report, then re-run with --execute.`)
    return
  }

  // EXECUTE: createOrReplace all new figmaArticle docs in a transaction.
  const tx = client.transaction()
  for (const doc of newDocs) tx.createOrReplace(doc)
  for (const doc of rewritten) tx.createOrReplace(doc)
  const result = await tx.commit({autoGenerateArrayKeys: true})
  console.log(`   ✅ Committed transaction. Mutations: ${result.results.length}`)
}

async function phaseCleanup({execute}) {
  console.log(`\n▶  Phase: cleanup   |   mode: ${execute ? 'EXECUTE' : 'DRY-RUN'}`)

  // Find remaining article docs. After migrate, these should have no inbound refs (they were rewritten).
  const remaining = await client.fetch(`*[_type == "article"]{_id, title, slug}`)
  console.log(`   Found ${remaining.length} remaining article docs.`)

  // Safety check: make sure nothing still references them.
  const stillReferenced = await client.fetch(
    `*[references($ids) && _type != "article"]{_id, _type}`,
    {ids: remaining.map((a) => stripDraft(a._id))}
  )

  const report = {
    phase: 'cleanup',
    mode: execute ? 'EXECUTE' : 'DRY-RUN',
    counts: {remaining: remaining.length, stillReferenced: stillReferenced.length},
    remaining,
    stillReferenced,
  }
  writeReport('cleanup-plan', report)

  if (stillReferenced.length > 0) {
    console.error(
      `   ❌ ${stillReferenced.length} doc(s) still reference articles. Run --phase=migrate first.`
    )
    console.error(`      See report for details.`)
    return
  }

  if (!execute) {
    console.log(`   Dry-run complete. Re-run with --execute to delete ${remaining.length} docs.`)
    return
  }

  const tx = client.transaction()
  for (const art of remaining) tx.delete(art._id)
  const result = await tx.commit()
  console.log(`   ✅ Deleted ${result.results.length} article docs.`)
}

async function phaseAudit() {
  console.log(`\n▶  Phase: audit (read-only)`)
  const articles = await fetchAllArticles()
  const inbound = await fetchReferencingDocsFull(articles.map((a) => stripDraft(a._id)))
  const idMap = new Map(articles.map((a) => [a._id, newIdFor(a._id)]))

  const report = {
    phase: 'audit',
    counts: {
      articles: articles.length,
      inboundRefDocs: inbound.length,
    },
    articles: articles.map((a) => ({
      _id: a._id,
      newId: idMap.get(a._id),
      title: a.title,
      slug: a.slug?.current,
      section: a.section,
      hasHeaderImage: Boolean(a.headerImage?.asset),
      hasAuthor: Boolean(a.author?._ref),
      hasBody: Array.isArray(a.body) && a.body.length > 0,
      readingTime: a.readingTime,
      category: a.category,
    })),
    inboundRefDocs: inbound.map((d) => ({_id: d._id, _type: d._type})),
  }
  writeReport('audit', report)
  console.log(`   ✅ Audit complete. ${articles.length} articles, ${inbound.length} inbound refs.`)
}

/* ------------------------------------------------------------------ */
/*  Entry                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  console.log(`🔧 Article → figmaArticle migration`)
  console.log(`   Phase:   ${PHASE}`)
  console.log(`   Execute: ${EXECUTE ? 'YES (will write)' : 'NO (dry-run)'}`)
  console.log(`   Drafts:  ${SKIP_DRAFTS ? 'skipped' : 'included'}`)

  if (PHASE === 'audit') return phaseAudit()
  if (PHASE === 'migrate') return phaseMigrate({execute: EXECUTE})
  if (PHASE === 'cleanup') return phaseCleanup({execute: EXECUTE})
  if (PHASE === 'all') {
    await phaseMigrate({execute: EXECUTE})
    await phaseCleanup({execute: EXECUTE})
  }
}

main().catch((err) => {
  console.error('\n❌ Migration failed:')
  console.error(err)
  process.exit(1)
})
