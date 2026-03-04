## OPEN LOOPS & DECISIONS

This document lists areas where the repository indicates partial migration, TODOs, placeholders, or duplicate systems. Each item includes a proposed decision and next action.

---

### 1. Chart Schema Consolidation (`chartData`)

- **Evidence**
  - `chartData` is the active chart document schema in Studio.
  - `blockContent` chart references point at `chartData`.
  - Frontend chart loading uses `/api/chart/[id]` with `chartData` documents.
- **Impact**
  - The chart model is now single-path and easier for editors and developers.
- **Decision (current)**
  - **`chartData` is the canonical and only chart schema.**
- **Next actions**
  1. Keep chart docs and UI docs aligned around `chartData`.
  2. Continue adding renderer support for remaining chart types as needed.

---

### 2. Animation Fields vs. Scroll-Based Implementation

- **Evidence**
  - `readme/AUDIT.md` (lines 42–51, 60–71) explicitly notes:
    - `animationDuration` and `animationEasing` are defined in schemas but **not used** in the current frontend.
  - `chartData` schema (`studio-breaking-ground/schemaTypes/chartData.ts`) defines:
    - `animationDuration` and `animationEasing` with default values and descriptions.
  - Chart components:
    - `BarChartAnimated.tsx`, `LineChartAnimated.tsx`, `PieChartAnimated.tsx`:
      - Implement scroll‑driven animation using a fixed `easeOutCubic` pattern and smoothing factor.
      - Accept `duration` in props but do not use schema‑driven easing.
- **Impact**
  - Editors may reasonably expect changes to `animationDuration` / `animationEasing` to affect charts, but they currently do not.
  - The contract between schema and frontend is misleading.
- **Decision (recommended)**
  - **Document that animation fields are presently advisory only** and are not wired into the current scroll‑based animation code.
- **Next actions**
  1. In `docs/README_CONTRACTS.md`, explicitly call out that these fields are unused by the current chart implementations (already done in this documentation pass).
  2. When/if you want time‑based animations:
     - Decide whether to replace scroll‑based animation or augment it with schema‑driven settings.
     - Implement new easing/animation logic in `BarChartAnimated.tsx`, `LineChartAnimated.tsx`, `PieChartAnimated.tsx` that reads from `animationDuration` and `animationEasing`.

---

### 3. Unimplemented Chart Types (`area`, `scatter`, `stacked`)

- **Evidence**
  - `chartData` schema (`studio-breaking-ground/schemaTypes/chartData.ts`) includes `chartType` options:
    - `'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'stacked'`.
  - `readme/SCHEMA_DIFF.md` Next Steps (lines 169–175) list:
    - “Implement missing chart types (line, area, scatter, stacked)”.
  - Frontend implementation:
    - `ChartFromRefClient.tsx` only has paths for:
      - `"bar"` → `AnimatedBarClient`.
      - `"pie"` → `AnimatedPieClient`.
      - `"line"` → `AnimatedLineClient`.
      - Everything else → text fallback: `Chart type "{doc.chartType}" not implemented.`
- **Impact**
  - Editors can select `area`, `scatter`, or `stacked` in Studio, but corresponding charts do not render as charts.
  - This may lead to confusion and content that appears broken.
- **Decision (recommended)**
  - **Treat `area`, `scatter`, and `stacked` as future/experimental chart types** and clearly document that they are not yet implemented in the frontend.
- **Next actions**
  1. In Studio documentation or field descriptions, add a note (when you are ready to edit schemas) indicating that only `bar`, `line`, and `pie` are currently supported in the UI.
  2. Optionally:
     - Temporarily restrict `chartType` options in the schema to just implemented types, or
     - Add a warning in `ChartDataPreview.tsx` (already referenced in docs) when an unimplemented type is chosen.

---

### 4. Legacy `/data/[slug]` Route Cleanup

- **Evidence**
  - The dedicated `/data/[slug]` route has been removed.
  - Charts are rendered through article blocks and `/api/chart/[id]`.
- **Impact**
  - One fewer legacy rendering path to maintain.
- **Decision (current)**
  - **Use inline chart blocks (`chartData` references) as the chart entrypoint.**
- **Next actions**
  1. Keep links and editorial guidance focused on article pages and inline chart blocks.

---

### 5. Vite SPA Legacy Query Alignment

- **Evidence**
  - `frontend/src/App.tsx` now queries:
    - `*[_type == "article"] | order(publishedAt desc)`.
  - The main system overview labels `frontend/` as “React + Vite frontend (legacy)”.
- **Impact**
  - The Vite app no longer depends on removed legacy schema types.
  - It remains a separate legacy UI surface with independent rendering/link assumptions.
- **Decision (recommended)**
  - **Treat the Vite SPA as legacy/experimental, not part of the primary stack.**
- **Next actions**
  1. Keep the code for reference, but:
     - Document clearly (as done in `README_SYSTEM_MAP.md`) that it is not wired to the current schema set.
  2. If you do not plan to use it:
     - Optionally move it under a `legacy/` folder in a future refactor, or
     - Add a high‑level comment in a dedicated docs section (no code change required now).

---

### 6. Next.js Config Placeholder

- **Evidence**
  - `nextjs-breaking-ground/next.config.ts`:
    - Contains `const nextConfig: NextConfig = { /* config options here */ }` with no non‑default options.
  - README and code assume Vercel deployment but there are no custom `images`, `headers`, `redirects`, or `experimental` settings.
- **Impact**
  - No functional risk today, but:
    - Cross‑origin images, static cache headers, and revalidation strategies may need explicit configuration as the project grows.
- **Decision (recommended)**
  - **Acknowledge `next.config.ts` as intentionally minimal for now.**
- **Next actions**
  1. When you introduce non‑default behavior (e.g., custom image domains, redirects, advanced caching):
     - Capture the decisions in `next.config.ts`.
     - Mirror those decisions in a short section in documentation so they stay discoverable.

---

### 7. Map Feature Gaps

- **Evidence**
  - `readme/README-MAPS.md` (now under `readme/`) describes “What it does not do (yet)”:
    - No stacked columns (only grouped side‑by‑side).
    - No legend/color ramp (beyond basic deck.gl columns).
    - No per‑feature hover tooltips.
    - No on‑page controls to switch properties.
  - Implementation of `MapEmbedClient` (`nextjs-breaking-ground/src/components/MapEmbedClient.tsx`):
    - Renders grouped `ColumnLayer` columns.
    - Does not include hover tooltips or interactive property switching.
- **Impact**
  - Editors can configure multiple `valueProperties`, but:
    - There is no built‑in legend beyond the column colors themselves.
    - Users cannot explore different properties interactively.
- **Decision (recommended)**
  - **Treat these as explicitly out‑of‑scope enhancements, not bugs.**
- **Next actions**
  1. Keep the current map UX as‑is and consider:
     - Adding a short note in map‑related docs (already present in `README-MAPS`) to keep expectations aligned.
  2. If you prioritize map UX later:
     - Design a dedicated roadmap for legends, tooltips, and interactive controls.

---

### 8. Root Documentation Structure vs. `readme/` Folder

- **Evidence**
  - All original narrative docs are now under `readme/`:
    - `readme/README-root.md`
    - `readme/README-MAPS.md`
    - `readme/AUDIT.md`
    - `readme/SCHEMA_DIFF.md`
    - `readme/README-nextjs.md`
    - `readme/README-studio.md`
    - `readme/README-frontend.md`
  - New system‑level docs are under `docs/`:
    - `docs/README_SYSTEM_MAP.md`
    - `docs/README_CONTRACTS.md`
    - `docs/OPEN_LOOPS.md`
- **Impact**
  - There are now two documentation clusters:
    - `readme/` (original, narrative and migration notes).
    - `docs/` (structured system and contracts documentation).
- **Decision (recommended)**
  - **Use `docs/` for stable, system‑level documentation and treat `readme/` as historical and narrative references.**
- **Next actions**
  1. Keep the root `README.md` focused on:
     - A short project overview.
     - Links into `docs/` for system/contract/open‑loop details.
     - Pointer to `readme/` for deeper background documents.

