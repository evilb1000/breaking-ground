import Masthead from "@/components/Masthead";

export default function AboutPage() {
  return (
    <>
      <Masthead homeHref="/" />
      <main className="min-h-screen bg-white text-black px-4 md:px-12 lg:px-24 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-center">
            About Breaking Ground
          </h1>

          <div className="mt-12 space-y-6 text-lg md:text-xl leading-relaxed text-gray-800">
            <p>
              BreakingGround is the premiere source for construction and development news in
              Pittsburgh and Western Pennsylvania. Operated by the Master Builders&rsquo;
              Association of Western Pennsylvania, we provide reporting, market insight, and
              economic data for professionals across the construction and real estate industries.
            </p>

            <p>
              The platform covers major projects, infrastructure investment, development
              activity, and economic trends shaping Western Pennsylvania. Our readers include
              developers, architects, engineers, contractors, suppliers, and public officials
              involved in all facets of building.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
