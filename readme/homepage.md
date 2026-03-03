# Homepage

This document breaks down the current homepage implementation in `nextjs-breaking-ground/src/app/page.tsx`.

## 1) Render tree

### Route-level wrappers

- `RootLayout` (applies to homepage route): `nextjs-breaking-ground/src/app/layout.tsx`
- `IndexPage` (homepage page component): `nextjs-breaking-ground/src/app/page.tsx`

```tsx
// nextjs-breaking-ground/src/app/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {isDev && (
          <a href="http://localhost:3333" target="_blank" rel="noopener noreferrer">
            Sanity Studio →
          </a>
        )}
        {children}
      </body>
    </html>
  );
}
```

### Components imported/used by `page.tsx`

- `Link` from `next/link` (used for featured story + more stories links)
- No nested homepage-only React components are imported from local files.
- Homepage UI is built inline with native JSX elements: `main`, `header`, `section`, `div`, `img`, `h1`, `h2`, `h3`, `h4`, `p`, `span`, `time`.

```tsx
// nextjs-breaking-ground/src/app/page.tsx
import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
```

```tsx
// nextjs-breaking-ground/src/app/page.tsx
return (
  <main className="bg-white text-black px-6 md:px-12 py-12 max-w-5xl mx-auto">
    <header className="sticky top-0 z-50 bg-white text-center px-6 py-6 border-b border-gray-200">...</header>
    {featured && (
      <section className="mt-12 mb-16">
        <Link href={`/${featured.slug.current}`} className="block group">
          ...
        </Link>
      </section>
    )}
    {moreStories.length === 0 ? (
      <p className="text-gray-500">No additional articles yet.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {moreStories.map((article) => (
          <Link href={`/${article.slug.current}`} className="group block" key={article._id}>
            ...
          </Link>
        ))}
      </div>
    )}
  </main>
);
```

## 2) Data flow

### Where Sanity client is initialized

Path: `nextjs-breaking-ground/src/sanity/client.ts`

```ts
import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "y9xwdi89",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});
```

### Every GROQ query used by homepage (full text)

Path: `nextjs-breaking-ground/src/app/page.tsx`

```ts
const FEATURED_QUERY = `*[_type in ["article","animatedData"] && featured == true && defined(slug.current)]
  | order(_updatedAt desc)[0]{
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

```ts
const FALLBACK_LATEST_QUERY = `*[_type in ["article","animatedData"] && defined(slug.current)]
  | order(publishedAt desc)[0]{
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

```ts
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

### What types are queried

- Queried types: `article`, `animatedData`
- Not queried by homepage: `postType`, `issue`, `chartData`, `author` (as root docs), etc.
- `author` is dereferenced as a field (`author->{name, image}`) on queried docs.

### Fields selected vs fields required by UI

Selected by all 3 queries:

- `_id`
- `title`
- `dek`
- `slug`
- `publishedAt`
- `category`
- `headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}`
- `author->{name, image}`

Required by rendered UI path:

- Hard-required for functioning story link/title card:
  - `_id` (used for list key and dedupe)
  - `slug.current` (used to build `href`)
  - `title` (rendered as headline text and image alt fallback)
- Conditionally rendered (safe to be missing):
  - `dek` (shown only if present)
  - `publishedAt` (shown only if present)
  - `category` (shown only if present in story cards)
  - `author.name` (shown only if present)
  - `headerImage.asset` (if absent, featured shows placeholder; story cards render no image)
- Selected but not currently used in homepage JSX:
  - `author.image`
  - `headerImage.caption`
  - `headerImage.crop`
  - `headerImage.hotspot`
  - `headerImage.asset.url`
  - `headerImage.asset._ref`
  - `headerImage.asset._type`

Evidence:

```tsx
// nextjs-breaking-ground/src/app/page.tsx
<Link href={`/${featured.slug.current}`} className="block group">
  ...
  <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight group-hover:underline">
    {featured.title}
  </h2>
  {featured.dek ? <p className="mt-4 text-lg italic text-gray-600 leading-relaxed max-w-3xl">{featured.dek}</p> : null}
  <div className="mt-4 text-sm text-gray-500 flex flex-wrap items-center gap-2">
    {featured.author?.name && <span className="uppercase tracking-wide">By {featured.author.name}</span>}
    {featured.publishedAt && <time>{formatDate(featured.publishedAt)}</time>}
  </div>
</Link>
```

```tsx
// nextjs-breaking-ground/src/app/page.tsx
{moreStories.map((article) => (
  <Link href={`/${article.slug.current}`} className="group block" key={article._id}>
    ...
    <h4 className="font-serif text-xl font-semibold leading-snug group-hover:underline">{article.title}</h4>
    {article.dek ? <p className="text-gray-600 text-sm leading-relaxed mt-2 line-clamp-2">{article.dek}</p> : null}
    <div className="text-[11px] uppercase tracking-wide text-gray-500 mt-3 flex flex-wrap gap-2">
      {article.author?.name && <span>By {article.author.name}</span>}
      {article.category && <span>{article.category}</span>}
    </div>
  </Link>
))}
```

## 3) Behavior

### Sorting logic

- Featured candidate: newest updated featured doc by `_updatedAt desc`, first item only.
- Fallback featured: newest published doc by `publishedAt desc`, first item only.
- More stories source list: newest published docs by `publishedAt desc`.

```ts
// nextjs-breaking-ground/src/app/page.tsx
| order(_updatedAt desc)[0]
| order(publishedAt desc)[0]
| order(publishedAt desc)[0...7]
```

### Filters

- Type filter: `_type in ["article","animatedData"]`
- Featured filter (featured query only): `featured == true`
- Slug gate (all queries): `defined(slug.current)`
- No filters for `postType`, `section`, `tags`, `issue`, or category values.

### Pagination or limits

- No pagination.
- Hard limits:
  - Featured/fallback each fetch one item (`[0]`)
  - More stories query fetches up to 7 (`[0...7]`)
  - UI then slices to 6 after dedupe against featured.

```ts
// nextjs-breaking-ground/src/app/page.tsx
const moreStories = featured ? list.filter((a) => a._id !== featured._id).slice(0, 6) : list.slice(0, 6);
```

## 4) Caching

Homepage caching/revalidation behavior in `nextjs-breaking-ground/src/app/page.tsx`:

- `export const revalidate = 0;`
- Query options passed to `client.fetch`: `{ next: { revalidate: 0 } }`
- No explicit `cache: "no-store"` usage.
- No server actions in homepage.

```ts
export const revalidate = 0;
const options = { next: { revalidate: 0 } };
...
await client.fetch<any | null>(FEATURED_QUERY, {}, options)
await client.fetch<any | null>(FALLBACK_LATEST_QUERY, {}, options)
await client.fetch<any[]>(MORE_STORIES_QUERY, {}, options)
```

Interpretation:

- Route is configured to avoid ISR caching (`revalidate = 0`).
- Each query also opts into immediate revalidation behavior with `next.revalidate = 0`.
- Combined effect is effectively dynamic/fresh fetch behavior per request path.

## 5) Change safety map

### Safe to change (low break risk)

- Masthead text and static labels in homepage JSX.
- Tailwind classes/layout styling.
- Optional field usage in UI (`dek`, `author.name`, `category`, `publishedAt`) because each is conditionally rendered.
- Image dimensions/crop transform parameters in `urlFor(...).width(...).height(...).fit('crop')`.
- Increasing/decreasing "more stories" UI slice count as long as query and UI expectations remain aligned.

### Break-risk changes (schema/query contract sensitive)

- Removing `slug.current` from queried docs or allowing undefined slugs to pass through:
  - Breaks link generation in both featured and more story cards.
- Removing `title` from selection:
  - Breaks headline text and alt fallback rendering.
- Removing `_id` from selection:
  - Breaks list key and featured dedupe logic.
- Renaming/removing `headerImage` shape without updating UI:
  - Breaks image rendering/placeholder branching.
- Dropping support for `_type == "animatedData"` before legacy docs are migrated:
  - Homepage content count and featured fallback behavior may change unexpectedly.
- Changing `publishedAt` usage:
  - Affects fallback selection and recency ordering.
- Changing featured semantics (`featured == true`) or deleting field without query update:
  - Featured query may return null more often, forcing fallback path.

Contract-sensitive lines:

```ts
// nextjs-breaking-ground/src/app/page.tsx
*[_type in ["article","animatedData"] && featured == true && defined(slug.current)]
...
*[_type in ["article","animatedData"] && defined(slug.current)]
...
const moreStories = featured ? list.filter((a) => a._id !== featured._id).slice(0, 6) : list.slice(0, 6);
...
<Link href={`/${featured.slug.current}`} className="block group">
...
<Link href={`/${article.slug.current}`} className="group block" key={article._id}>
```
