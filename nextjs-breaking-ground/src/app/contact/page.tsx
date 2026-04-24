import Link from "next/link";
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon";
import HomepageEventBanner from "@/components/homepage/HomepageEventBanner";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-[#312e28]">
      <HomepageTopRibbon />

      <section className="relative border-b border-[#2d567b] bg-[#285a8a]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.2))]" />
        <div className="relative mx-auto flex h-[148px] w-full max-w-[1440px] items-end px-6 pb-6 text-white">
          <div className="mx-auto w-[922px] text-right">
            <p className="bg-font-roboto text-[14px] leading-[18px]">
              <Link href="/" className="underline">
                Home
              </Link>{" "}
              / <span className="text-white/70">Contact</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[922px] px-4 pb-[72px] pt-[40px] md:px-0">
        <h1 className="bg-type-h1 text-[#312e28]">Contact</h1>

        <div className="mt-[32px] flex flex-col gap-[20px]">
          <p className="bg-type-body text-[#312e28]">
            Have a story idea? Want to sponsor? Feel free to reach out.
          </p>
          <p className="bg-type-body text-[#312e28]">
            Ben Atwood,{" "}
            <a
              href="mailto:Ben@mbawpa.org"
              className="underline hover:opacity-70 transition-opacity"
            >
              Ben@mbawpa.org
            </a>
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-[26px]">
        <HomepageEventBanner
          title="Come Join Us At the 2025 Evening of Excellence"
          subtitle="Event starts 8:00 pm on 04.13.2026"
          body="Join us for an unforgettable evening of celebration, inspiration, and impact."
          ctaLabel="Register here"
          ctaHref="https://www.mbawpa.org/events/mba-young-constructors-leadership-development-seminar/"
        />
      </div>
    </main>
  );
}
