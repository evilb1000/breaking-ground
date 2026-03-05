import Link from "next/link";

type Props = {
  message?: string;
  linkLabel?: string;
  linkUrl?: string;
};

export default function AnnouncementBar({ message, linkLabel, linkUrl }: Props) {
  const text = message || "Support Western Pennsylvania construction journalism.";
  const cta = linkLabel || "Become a sponsor.";
  const href = linkUrl || "#";

  return (
    <section className="w-full h-20 md:h-28 border-y border-gray-200 flex items-center justify-center mb-10 px-4 md:px-0 bg-white" aria-label="Announcement">
      <p className="text-xl md:text-3xl font-sans font-medium tracking-wide text-gray-700 text-center">
        {text}{" "}
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 font-semibold underline underline-offset-2 hover:opacity-70"
        >
          {cta}
        </Link>
      </p>
    </section>
  );
}
