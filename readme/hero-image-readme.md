# Hero Image README

This is the current source-of-truth for homepage hero/header-image behavior in:

- `nextjs-breaking-ground/src/app/page.tsx`

The homepage now has **two featured hero render paths**:

1. `featured.category === "feature"` -> split editorial hero (text + image)
2. all other categories -> legacy full-width featured card

Both paths use `headerImage` from Sanity (not legacy `heroImage`).
Both paths now use hero copy priority: `heroLede` first, fallback to `dek`.

---

## 1) Data source and schema contract

Homepage featured queries project:

```ts
// nextjs-breaking-ground/src/app/page.tsx
headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}
```

Homepage featured queries also project hero copy fields:

```ts
// nextjs-breaking-ground/src/app/page.tsx
title,
dek,
heroLede,
```

Schema origin:

- `studio-breaking-ground/schemaTypes/baseArticle.js` -> `headerImage` field (`type: 'image'`, `hotspot: true`, `alt`, `caption`)
- `studio-breaking-ground/schemaTypes/article.ts` -> inherits from `baseArticle`

Legacy note:

- `heroImage` still exists as hidden/read-only legacy field in `baseArticle`
- homepage hero rendering does not read it

---

## 2) URL builder and transforms

Builder:

```ts
// nextjs-breaking-ground/src/app/page.tsx
const urlFor = (source: SanityImageSource) =>
  imageUrlBuilder({ projectId: client.config().projectId!, dataset: client.config().dataset! })
    .image(source);
```

Featured transform by path:

- `feature` category hero: `.width(1200).height(1500).fit('crop')`
- non-feature hero: `.width(1600).height(900).fit('crop')`

---

## 3) Current featured hero structure

### A) Feature category (`featured.category === "feature"`)

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<Link href={`/${featured.slug.current}`} className="block group">
  <div className="w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      <div className="order-2 md:order-1 flex items-center">
        <div className="max-w-2xl">{/* title + (heroLede || dek) */}</div>
      </div>

      <div className="order-1 md:order-2 h-[45vh] w-full overflow-hidden rounded-lg">
        {featured?.headerImage?.asset ? (
          <img className="w-full h-full object-cover object-center" ... />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
      </div>
    </div>
  </div>
</Link>
```

Behavior:

- image is first on small screens (`order-1`) and second on desktop (`md:order-2`)
- image wrapper controls height (`h-[45vh]`)
- `img` is fully constrained to wrapper (`w-full h-full object-cover object-center`)
- no hover zoom/opacity effect in this branch
- no byline/date row in hero text (removed)

### B) Non-feature category (fallback featured layout)

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<Link href={`/${featured.slug.current}`} className="block group">
  <div className="w-full overflow-hidden rounded-lg mb-6">
    {featured?.headerImage?.asset ? (
      <img className="w-full h-[300px] md:h-[400px] object-cover object-center transition-transform ... group-hover:scale-[1.03] group-hover:opacity-95" ... />
    ) : (
      <div className="w-full h-[300px] md:h-[400px] bg-gray-100" />
    )}
  </div>
  {/* title + (heroLede || dek) */}
</Link>
```

---

## 4) Header + section spacing that affects hero visibility

The masthead and section spacing directly influence how much hero is visible without scrolling:

- sticky masthead:
  - `sticky top-0 z-50 bg-white text-center px-6 py-6 border-b border-gray-200`
- featured section spacing:
  - feature: `mt-2`
  - non-feature: `mt-12`

This spacing is controlled in:

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<section className={`${featured.category === "feature" ? "mt-2" : "mt-12"} mb-16`}>
```

---

## 5) Practical implications

- If `headerImage.asset` exists, hero image renders from Sanity with branch-specific transform/height behavior.
- If missing, placeholder still preserves layout (`w-full h-full bg-gray-100` for feature branch).
- If `featured.category` is not `"feature"`, the viewport-height behavior does not apply.
- Renaming/removing `headerImage` in schema/query without frontend updates breaks hero image rendering.
- `heroLede` is the dedicated homepage featured hero line (fallback remains `dek`).
- `author`/`publishedAt` are still queried but no longer rendered in the homepage hero copy area.
