import Masthead from "@/components/Masthead";

export default function ContactPage() {
  return (
    <>
      <Masthead homeHref="/" />
      <main className="min-h-screen bg-white text-black px-4 md:px-12 lg:px-24 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-center">
            Contact
          </h1>
          <div className="mt-12 space-y-6 text-lg md:text-xl leading-relaxed text-gray-800 text-center">
            <p>
              Have a story idea? Want to sponsor? Feel free to reach out.
            </p>
            <p>
              Ben Atwood, <a href="mailto:Ben@mbawpa.org" className="underline hover:opacity-70 transition-opacity">Ben@mbawpa.org</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
