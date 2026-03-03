# Header Size README

This document records the **current** homepage header/featured hero sizing model in:

- `nextjs-breaking-ground/src/app/page.tsx`

---

## 1) Masthead (site header) sizing/position

Current masthead class:

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<header className="sticky top-0 z-50 bg-white text-center px-6 py-6 border-b border-gray-200">
```

What this means:

- sticky at top of viewport
- white background
- high stacking (`z-50`) above page content
- padded (`px-6 py-6`)
- faint bottom rule (`border-b border-gray-200`)

---

## 2) Featured section spacing (feature vs non-feature)

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<section className={`${featured.category === "feature" ? "mt-2" : "mt-12"} mb-16`}>
```

- `feature` category: tighter top spacing (`mt-2`) for earlier hero visibility
- non-feature categories: original spacing (`mt-12`)

---

## 3) Feature hero frame sizing (current)

Current structure:

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<div className="w-full">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
    <div className="order-2 md:order-1 flex items-center">
      <div className="max-w-2xl">{/* title + (heroLede || dek) */}</div>
    </div>

    <div className="order-1 md:order-2 h-[45vh] w-full overflow-hidden rounded-lg">
      <img className="w-full h-full object-cover object-center" ... />
    </div>
  </div>
</div>
```

Sizing control details:

- **Image wrapper controls height**: `h-[45vh]`
- **Image fills wrapper**: `w-full h-full object-cover object-center`
- **Text does not set image height**
- **No md-gated hero-height class** in this branch
- **Hero copy no longer renders byline/date**; it renders `heroLede` fallback `dek`.

---

## 4) Non-feature hero sizing (unchanged)

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<img className="w-full h-[300px] md:h-[400px] object-cover object-center transition-transform ... group-hover:scale-[1.03] group-hover:opacity-95" />
```

Fallback placeholder:

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<div className="w-full h-[300px] md:h-[400px] bg-gray-100" />
```

---

## 5) Height-related classes in homepage file (current)

From `nextjs-breaking-ground/src/app/page.tsx`:

- `h-[45vh]` (feature hero image wrapper)
- `h-full` (feature image + feature placeholder)
- `h-[300px] md:h-[400px]` (non-feature featured image + placeholder)
- `h-[180px]` (more stories card image wrapper)
- `h-full` (more stories card image)

---

## 6) Tailwind support status

Project setup confirms Tailwind arbitrary utilities are compiling:

- `tailwindcss` v4 via `nextjs-breaking-ground/package.json`
- `@tailwindcss/postcss` wired in `nextjs-breaking-ground/postcss.config.mjs`
- imported in `nextjs-breaking-ground/src/app/globals.css` with `@import "tailwindcss"`

The current model intentionally uses plain viewport unit `vh` (`h-[45vh]`) for Safari reliability.
