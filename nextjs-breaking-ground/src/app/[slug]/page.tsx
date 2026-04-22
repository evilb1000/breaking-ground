import { client } from "@/sanity/client";
import ProjectProfilePage from "@/components/ProjectProfilePage";
import FigmaArticlePage from "@/components/FigmaArticlePage";
import Masthead from "@/components/Masthead";
import Link from "next/link";

const ENTRY_QUERY = `*[_type in ["projectProfile", "figmaArticle"] && slug.current == $slug][0]{
  _type,
  title,
  headline,
  dek,
  publishedAt,
  readingTime,
  section,
  articleTag,
  introImage{_type, asset, "assetUrl": asset->url, alt, caption, crop, hotspot},
  headerImage{_type, asset, "assetUrl": asset->url, alt, caption, crop, hotspot},
  heroImage{_type, asset, "assetUrl": asset->url, alt, caption, crop, hotspot},
  author->{name, image, bio},
  authorBio,
  coAuthors[]->{name, image},
  series->{title, slug, seriesImage{_type, asset, "assetUrl": asset->url, alt, caption, crop, hotspot}},
  category,
  body[]{
    ...,
    mapFile{asset->{url}},
    dataFile{asset->{url}}
  },
  featured,
  relatedArticles[]->{
    _id,
    _type,
    "slug": slug.current,
    title,
    headline,
    section,
    category,
    publishedAt,
    headerImage{_type, asset, "assetUrl": asset->url, alt, crop, hotspot},
    introImage{_type, asset, "assetUrl": asset->url, alt, crop, hotspot}
  },
  nextArticle->{
    _id,
    _type,
    "slug": slug.current,
    title,
    headline,
    section,
    category
  },
  // Project Profile fields
  projectName,
  architect,
  generalContractor,
  owner,
  completionDate,
  projectSize,
  projectCost,
  location,
  projectType,
  pageContent[]{
    ...,
    image{..., asset->{url}},
    imageLeft{..., asset->{url}},
    imageRight{..., asset->{url}},
    images[]{..., image{..., asset->{url}}},
    body[]{
      ...,
      mapFile{asset->{url}},
      dataFile{asset->{url}}
    },
    text[]{
      ...,
      mapFile{asset->{url}},
      dataFile{asset->{url}}
    }
  }
}`;

export const revalidate = 0;
const options = { next: { revalidate: 0 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // The ENTRY_QUERY returns either a projectProfile or figmaArticle; each
  // receiving component owns its own typing so we keep this union-y on purpose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const article = await client.fetch<any | null>(ENTRY_QUERY, await params, options);

  if (!article) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
        <Link href="/" className="hover:underline">
          ← Back to posts
        </Link>
        <h1 className="text-2xl font-semibold">Article not found</h1>
      </main>
    );
  }

  if (article._type === "projectProfile") {
    return (
      <div className="pp-profile-layout">
        <Masthead homeHref="/" />
        <main className="min-h-screen bg-white text-black">
          <ProjectProfilePage project={article} />
        </main>
      </div>
    );
  }

  if (article._type === "figmaArticle") {
    return <FigmaArticlePage article={article} />;
  }

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/" className="hover:underline">
        ← Back to posts
      </Link>
      <h1 className="text-2xl font-semibold">Unsupported content type</h1>
    </main>
  );
}
