## Sanity Schema Audit – `issue` and `post`

This doc summarizes how the `issue` and `post` concepts are wired into **Breaking Ground** (Next.js + Sanity), and how to remove them safely.

---

### Summary

- **`issue` document type**
  - Exists only to tag articles with a magazine issue.
  - It is **optional**, not rendered anywhere on the site, and only projected in one GROQ query.
  - **SAFE TO REMOVE** from the schema and queries with a small set of edits.

- **`postType` / `"post"` document type**
  - Defined in Studio as `name: "post"` (file `postType.ts`).
  - Used only by the **legacy Vite SPA** in `frontend/`, never by the Next.js app.
  - **SAFE TO REMOVE** for the Next.js + Studio article flows; affects only the legacy SPA if you still care about it.

---

### Where `issue` and `post` are used

#### Used in schema

- `studio-breaking-ground/schemaTypes/issue.ts`
  - Defines the `issue` document type:
    - `title: string` (required)
    - `slug: slug` (required, source: `title`)
    - `publishedAt: datetime` (optional)

- `studio-breaking-ground/schemaTypes/postType.ts`
  - Defines the `post` document type (exported as `postType`):
    - `title: string` (required)
    - `slug: slug` (required, source: `title`)
    - `publishedAt: datetime` (required, with `initialValue`)
    - `image: image` (optional)
    - `body: array` of `block` (optional)

- `studio-breaking-ground/schemaTypes/index.ts`
  - Wires both into the Studio:
    - Imports: `postType` and `issue`.
    - Exports: `schemaTypes = [blockContent, author, issue, postType, article, animatedData, chartData, mapEmbed]`.

- `studio-breaking-ground/schemaTypes/baseArticle.js`
  - Adds an **optional** reference field to `issue` on the base article schema:
    - `name: "issue"`, `type: "reference"`, `to: [{ type: "issue" }]`.

#### Used in Studio structure

- `studio-breaking-ground/sanity.config.ts`
  - Uses `structureTool()` with **default** structure:
    - `schema.types = schemaTypes`.
  - Because `schemaTypes` includes `issue` and `postType`, **“Issue”** and **“Post”** appear as top‑level document lists.
  - There is **no custom desk structure file**; removing them from `schemaTypes` is enough to remove them from the sidebar.

#### Used in Next.js queries

- `nextjs-breaking-ground/src/app/[slug]/page.tsx`
  - Article/animatedData detail query:
    - `ENTRY_QUERY = *[_type in ["article","animatedData"] && slug.current == $slug][0]{ ... }`
    - Projects `issue->{title}` but does **not** filter on `_type == "issue"`.
  - No rendering logic currently uses `article.issue`.

- `nextjs-breaking-ground/src/app/page.tsx`
  - Home queries only `_type in ["article","animatedData"]`.

- `nextjs-breaking-ground/src/app/data/[slug]/page.tsx`
  - Queries only `_type == "animatedData"`.

- `nextjs-breaking-ground/src/app/api/chart/[id]/route.ts`
  - Queries only `_type in ["chartData", "animatedData"]`.

> **Conclusion:** Next.js does **not** depend on `issue` or `post`/`postType` for any filtering or navigation logic. `issue` is only fetched and then ignored.

#### Used in rendering components

- `nextjs-breaking-ground/src/app/[slug]/page.tsx`
  - Renders title, dek, dates, header image, author, category, body, charts, and maps.
  - Never reads `article.issue` in the component code.
  - The word “posts” appears only in copy (“Back to posts”), not as a schema/type.

#### Used in legacy Vite SPA

- `frontend/src/App.tsx`
  - Fetches and renders `"post"` documents:
    - GROQ: `*[_type == "post"] | order(publishedAt desc)`.
    - Displays title, `publishedAt`, image, and link to `/post/{slug.current}`.

> **Conclusion:** `"post"` is only used by the legacy `frontend/` SPA and its CSS; it is not used in the Next.js app.

---

### SAFE TO REMOVE? (Per type)

- **`issue`**
  - **SAFE TO REMOVE: YES**, if you:
    - Remove the `issue` reference field from `baseArticle`.
    - Remove `issue->{title}` from the `[slug]` article query.
    - Remove `issue` from `schemaTypes` and delete `issue.ts`.
  - All usages are optional metadata. No UI depends on it.

- **`postType` / `"post"`**
  - **SAFE TO REMOVE for Next.js + Studio article flows: YES.**
  - **Impact on legacy Vite SPA:**
    - SPA currently queries `_type == "post"` and renders posts.
    - Removing the schema type means:
      - Studio will no longer show “Post” as a document type.
      - You won’t be able to edit/create posts in Studio.
    - Deleting `"post"` documents from the dataset makes the SPA show “No posts yet…” forever.

---

### Exact removal steps

#### Remove `issue`

1. **Update the article query**

   - File: `nextjs-breaking-ground/src/app/[slug]/page.tsx`
   - In `ENTRY_QUERY`, remove the projection:
   - **Before:**
     - `author->{name, image},`
     - `category,`
     - `issue->{title},`
     - `body[]{ ... }`
   - **After:**
     - `author->{name, image},`
     - `category,`
     - `body[]{ ... }`

2. **Remove `issue` from the base article schema**

   - File: `studio-breaking-ground/schemaTypes/baseArticle.js`
   - Delete the `defineField({ name: "issue", ... })` block that references `{ type: "issue" }`.

3. **Remove `issue` from the schema index**

   - File: `studio-breaking-ground/schemaTypes/index.ts`
   - Remove:
     - `import {issue} from './issue'`
   - Remove `issue` from the exported `schemaTypes` array.

4. **Delete the schema file (optional but recommended)**

   - Remove `studio-breaking-ground/schemaTypes/issue.ts` from the repo.

5. **Optional dataset cleanup**

   - In Sanity Studio or via a script, delete any `issue` documents if the concept is no longer needed.

#### Remove `postType` / `"post"`

1. **Remove from schema index**

   - File: `studio-breaking-ground/schemaTypes/index.ts`
   - Remove:
     - `import {postType} from './postType'`
   - Remove `postType` from the `schemaTypes` array.

2. **Delete the schema file**

   - Remove `studio-breaking-ground/schemaTypes/postType.ts`.

3. **Decide what to do with the legacy SPA**

   - If the SPA in `frontend/` is **deprecated**:
     - You can safely leave it as-is; it will eventually show no posts once `"post"` docs are removed.
   - If you want to keep it working:
     - Either keep `"post"` documents in the dataset and accept that they are unmanaged in Studio, or
     - Rewrite its query to use `article` or another supported type.

4. **Optional dataset cleanup**

   - Delete `"post"` documents from the dataset when you no longer need them.

---

### Verification checklist

- **Studio (http://localhost:3333)**
  - Confirm that **“Issue”** and **“Post”** no longer appear in the document type list.
  - Open an existing **Article** and **Animated Data** document:
    - The form should load and save without errors.
    - There should be **no “Issue” field**.

- **Next.js site (http://localhost:3000 or current dev port)**
  - Load the **homepage** (`/`): stories render as before.
  - Load several article URLs (`/[slug]`):
    - Pages render hero, dek, byline, body, charts, and maps.
    - No runtime errors related to `issue` or `post`.

- **Legacy Vite SPA (`frontend/`, only if needed)**
  - `npm run dev` inside `frontend/`:
    - If `"post"` docs still exist, cards render as before.
    - If you deleted them, it should show the “No posts yet…” message without errors.

