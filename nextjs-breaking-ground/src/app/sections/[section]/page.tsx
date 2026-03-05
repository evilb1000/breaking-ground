import Link from "next/link";

const SECTIONS: Record<string, string> = {
  news: "News",
  "project-profiles": "Project Profiles",
  "member-profiles": "Member Profiles",
  features: "Features",
  perspectives: "Perspectives",
  "whats-it-cost": "Whats It Cost",
  "ai-in-construction": "AI In Construction",
};

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = SECTIONS[section];

  if (!title) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
        <h1 className="font-serif text-4xl font-bold">Section not found</h1>
        <Link href="/" className="mt-6 text-gray-600 hover:underline">
          ← Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
      <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight">
        {title}
      </h1>
      <p className="mt-4 text-lg text-gray-500">Coming soon.</p>
      <Link href="/" className="mt-8 text-gray-600 hover:underline">
        ← Back to home
      </Link>
    </main>
  );
}
