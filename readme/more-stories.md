# More Stories (Current Structure Audit)

This document is a comprehensive breakdown of the current **"More Stories"** section on the homepage, to support a careful carousel migration.

Source of truth:

- `nextjs-breaking-ground/src/app/page.tsx`

---

## 1) Section placement and layout context

The section is rendered after the featured hero block and inside the same homepage `<main>` container:

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<main className="bg-white text-black px-12 md:px-24 py-12 w-full">
  ...
  {/* More Stories */}
  <h3 className="font-serif text-xl font-bold tracking-tight mb-6 border-t border-gray-200 pt-8">
    More Stories
  </h3>
  {moreStories.length === 0 ? (
    <p className="text-gray-500">No additional articles yet.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">...</div>
  )}
</main>
```

Implications:

- section inherits global page horizontal padding (`px-12 md:px-24`)
- section is visually separated by top border + padding on heading (`border-t ... pt-8`)
- section does not use a separate wrapper component

---

## 2) Data source and flow

### Query for More Stories

```ts
// nextjs-breaking-ground/src/app/page.tsx
const MORE_STORIES_QUERY = `*[_type in ["article","animatedData"] && defined(slug.current)]
  | order(publishedAt desc)[0...7]{
    _id,
    title,
    dek,
    slug,
    publishedAt,
    category,
  headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  }`;
```

### Post-query shaping

```ts
// nextjs-breaking-ground/src/app/page.tsx
const list = await client.fetch<any[]>(MORE_STORIES_QUERY, {}, options);
const moreStories = featured ? list.filter((a) => a._id !== featured._id).slice(0, 6) : list.slice(0, 6);
```

Data behavior:

- initial fetch limit: up to 7 items
- dedupe against featured item by `_id`
- final rendered list capped at 6
- sorted by `publishedAt desc` (newest first)

---

## 3) Current grid structure (non-carousel)

Rendering uses a static CSS grid:

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
  {moreStories.map((article) => (
    <Link href={`/${article.slug.current}`} className="group block" key={article._id}>
      ...
    </Link>
  ))}
</div>
```

Behavior:

- mobile: single column (`grid-cols-1`)
- desktop (`md+`): two columns (`md:grid-cols-2`)
- spacing between cards: `gap-12`
- all cards are full clickable links

---

## 4) Card composition ("boxed" anatomy)

Each card contains:

1. **Image box**
2. **Headline**
3. **Optional dek snippet**
4. **Meta row (author + category)**

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<Link href={`/${article.slug.current}`} className="group block" key={article._id}>
  <div className="w-full h-[180px] overflow-hidden rounded-md mb-4 bg-gray-100">
    {article?.headerImage?.asset ? (
      <img
        src={src}
        alt={article.headerImage?.alt || article.title}
        className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
      />
    ) : null}
  </div>
  <h4 className="font-serif text-xl font-semibold leading-snug group-hover:underline">
    {article.title}
  </h4>
  {article.dek ? (
    <p className="text-gray-600 text-sm leading-relaxed mt-2 line-clamp-2">{article.dek}</p>
  ) : null}
  <div className="text-[11px] uppercase tracking-wide text-gray-500 mt-3 flex flex-wrap gap-2">
    {article.author?.name && <span>By {article.author.name}</span>}
    {article.category && (
      <>
        <span aria-hidden="true">•</span>
        <span>{article.category}</span>
      </>
    )}
  </div>
</Link>
```

---

## 5) Visual and interaction behavior

- card-level hover grouping via `group`
- image hover effects:
  - subtle zoom (`group-hover:scale-[1.03]`)
  - slight fade (`group-hover:opacity-95`)
- headline underline on hover (`group-hover:underline`)
- dek excerpt is constrained to 2 lines (`line-clamp-2`)

---

## 6) Image pipeline for cards

### URL generation

```ts
// nextjs-breaking-ground/src/app/page.tsx
const src = urlFor(article.headerImage as SanityImageSource)
  ?.width(800)
  .height(600)
  .fit('crop')
  .url() || ''
```

### Viewport box

- fixed card image viewport: `h-[180px]`
- image fill strategy: `w-full h-full object-cover object-center`
- fallback state if image missing: container stays, but no placeholder child image block is rendered (just gray bg from wrapper)

---

## 7) Required vs optional fields for More Stories UI

Hard-required for stable card rendering:

- `_id` (React key + featured dedupe logic)
- `slug.current` (card link destination)
- `title` (headline + alt fallback)

Optional UI fields:

- `dek` (only renders if present)
- `author.name` (only renders if present)
- `category` (only renders if present)
- `headerImage.asset` (only renders image if present)

Queried but not directly rendered in this block:

- `publishedAt` (used for ordering in query, not displayed)
- `author.image`
- `headerImage.caption`, `crop`, `hotspot`, asset metadata

---

## 8) Empty state behavior

If list resolves to zero cards:

```tsx
// nextjs-breaking-ground/src/app/page.tsx
{moreStories.length === 0 ? (
  <p className="text-gray-500">No additional articles yet.</p>
) : (
  ...
)}
```

No skeleton/loading state is currently implemented.

---

## 9) Caching/runtime behavior impacting section

Homepage settings apply to this section too:

```ts
// nextjs-breaking-ground/src/app/page.tsx
export const revalidate = 0;
const options = { next: { revalidate: 0 } };
```

Implication:

- list is fetched dynamically/fresh per request path rather than static ISR snapshots

---

## 10) Carousel migration risk map (things that can break)

### Data/logic risks

- dedupe coupling: list depends on featured `_id` filter
- hard cap coupling: query requests 7 but UI shows 6
- missing fields: cards must tolerate absent `dek`, `author`, `category`, `headerImage.asset`

### Layout/UX risks

- replacing grid with horizontal scroll can break current visual rhythm (`gap-12`, two-column balance)
- card widths/heights must stay consistent to avoid jumpy snap behavior
- hover interactions may feel odd on touch devices if unchanged
- heading border/top spacing currently assumes block/grid below, not slider controls

### Accessibility risks

- carousel must preserve keyboard navigation to each story link
- if arrows/dots are added, they require labels and focus styles
- avoid trapping focus in slider controls

### Performance risks

- if client-side carousel library is used, this section may become client-rendered and increase JS weight
- image strategy currently uses `<img>`; carousel transitions can amplify layout shift if dimensions are not fixed

---

## 11) Safe-change boundaries before carousel work

Safe to change with low schema risk:

- grid classes and card arrangement
- card container spacing
- hover animation details
- heading text and style

Contract-sensitive (high risk):

- removing `_id`, `slug`, or `title` from query payload
- changing dedupe logic that excludes featured article
- changing order/limit semantics without intentional design decision

---

## 12) Recommendation baseline for carousel refactor

When converting to carousel, preserve these invariants first:

1. Keep `MORE_STORIES_QUERY` fields unchanged initially.
2. Keep `featured` dedupe + `slice(0, 6)` behavior unchanged.
3. Keep card internals (image/title/dek/meta) unchanged in v1.
4. Replace only the outer grid shell with carousel viewport/track.

This minimizes risk and makes visual behavior easier to compare against current production behavior.
