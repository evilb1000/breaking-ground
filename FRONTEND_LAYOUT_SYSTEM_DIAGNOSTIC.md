# FRONTEND LAYOUT SYSTEM DIAGNOSTIC

Scope: `breaking-ground/nextjs-breaking-ground` (homepage + featured hero path)

Status: synced to current implementation in `src/app/page.tsx`.

---

## 1) Build & Runtime Verification

- **Dev command used**
  - `next dev --port 3000` (via `npm run dev -- --port 3000`)
- **Port being served**
  - `http://localhost:3000`
- **Multiple Next.js apps?**
  - No. Repo contains one Next app (`nextjs-breaking-ground`), one Vite app (`frontend`), and Sanity Studio (`studio-breaking-ground`).
- **Dev server cwd**
  - `/Users/ben/Coding Projects/BG_WEBSITE/breaking-ground/nextjs-breaking-ground`
- **Build artifacts**
  - `.next/dev` present (expected in dev), including cache and compiled CSS chunks.
- **Tailwind rebuild**
  - Current homepage classes are reflected in dev output and served HTML.

---

## 2) Tailwind Configuration & Compilation Audit

- **Tailwind version**
  - `tailwindcss` `^4` in `nextjs-breaking-ground/package.json`
- **Arbitrary values support**
  - Yes (Tailwind v4 CSS-first pipeline supports arbitrary utilities).
- **Custom config**
  - No `tailwind.config.*` found (valid for this setup).
- **PostCSS wiring**
  - `nextjs-breaking-ground/postcss.config.mjs` uses `@tailwindcss/postcss`.
- **Height utility compilation**
  - Current hero height utility compiles and is served: `h-[45vh]`.
- **Purging/class-drop risk**
  - Low for hero classes because class strings are explicit in `page.tsx`.

---

## 3) Global CSS & Layout Overrides

- `src/app/globals.css` imports Tailwind and typography plugin; no project-authored global `html/body` height locks.
- No global CSS found that forces hero/image height to a conflicting value on homepage.
- Parent constraints on homepage are primarily spacing/padding, not hard height caps.

Potential visible-impact globals:

- Sticky masthead consumes viewport space at top.
- Home container has vertical padding (`py-12`) and featured section has conditional top margin.

---

## 4) App Router & Layout Structure

- **Root layout**: `src/app/layout.tsx`
  - `<html><body>{children}</body></html>`
  - no viewport height constraints applied at root.
- **Homepage**: `src/app/page.tsx`
  - sticky masthead
  - featured section with category-conditional spacing
  - category-conditional featured hero branch

Current featured section wrapper:

```tsx
<section className={`${featured.category === "feature" ? "mt-2" : "mt-12"} mb-16`}>
```

---

## 5) Breakpoint Behavior Analysis

Current feature hero structure:

```tsx
<div className="w-full">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
    <div className="order-2 md:order-1 flex items-center">...</div>
    <div className="order-1 md:order-2 h-[45vh] w-full overflow-hidden rounded-lg">...</div>
  </div>
</div>
```

- Grid is responsive (`1` column mobile, `2` columns at `md`).
- **Height is not md-gated** anymore; `h-[45vh]` applies at all breakpoints.
- Image appears first on mobile due to ordering (`order-1` on image wrapper).

---

## 6) Component Hierarchy & Rendering Confirmation

- `featured.category === "feature"` branch exists and is used when featured content has `category: "feature"`.
- Non-feature branch remains in same file and is unchanged for other categories.
- No separate homepage hero component overrides this logic.

---

## 7) Height Propagation Analysis

Current propagation path for feature branch:

1. `section` provides top spacing (`mt-2` for feature).
2. Feature grid lays out text + image columns.
3. Image wrapper sets explicit height: `h-[45vh]`.
4. `<img>` uses `w-full h-full object-cover object-center`.

Why this is stable:

- The wrapper now provides a definite height independent of text height.
- Image fill behavior is constrained to that wrapper, avoiding content-driven expansion.

---

## 8) Caching & Hot Reload Verification

- Next dev server is active on `3000`.
- Sanity Studio is active on `3333`.
- Hot reload/build output is active in dev logs.
- Served HTML reflects current hero class changes.

If a browser still appears stale:

- hard refresh (`Cmd+Shift+R`)
- confirm URL is `http://localhost:3000` (not cached remote preview)

---

## 9) Conclusion

### Most likely historical root cause

Primary instability came from iterating between multiple height strategies (breakpoint-gated, container-level, and viewport variants), plus Safari-specific differences in viewport handling/caching perception.

### Current stabilized model

- feature hero image wrapper uses **`h-[45vh]`** (viewport-based, non-breakpoint-gated)
- image is first on small screens
- featured section spacing is reduced for feature branch (`mt-2`)

### Single structural correction now in place

**Use wrapper-controlled viewport height (`h-[45vh]`) on the feature image column with `img` set to `w-full h-full object-cover object-center`, while keeping non-feature hero unchanged.**
