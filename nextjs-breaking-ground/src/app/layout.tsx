import type { Metadata } from "next";
import { Crimson_Text, Geist, Geist_Mono, Roboto, Roboto_Condensed, Roboto_Flex } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin"],
  // Enable Roboto Flex's parametric axes. Without these, fontVariationSettings
  // values from the Figma design (GRAD, XOPQ, XTRA, YOPQ, YTAS, YTDE, YTFI,
  // YTLC, YTUC, wdth, opsz) are silently dropped by the browser and the
  // headline renders with default metrics instead of the Figma spec.
  axes: [
    "opsz",
    "wdth",
    "GRAD",
    "XOPQ",
    "XTRA",
    "YOPQ",
    "YTAS",
    "YTDE",
    "YTFI",
    "YTLC",
    "YTUC",
  ],
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Breaking Ground",
  description: "Breaking Ground – Western Pennsylvania construction news, project profiles, market analysis, and industry intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${robotoFlex.variable} ${robotoCondensed.variable} ${crimsonText.variable} antialiased`}
      >
        {isDev && (
          <a
            href="http://localhost:3333"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed top-3 right-3 z-50 px-3 py-1.5 text-sm font-medium bg-orange-500 text-white rounded shadow hover:bg-orange-600"
          >
            Sanity Studio →
          </a>
        )}
        {children}
        <Footer />
        <Script
          src="https://plausible.io/js/pa-mwb2bCJn6udlYoy9_0IwT.js"
          strategy="afterInteractive"
          async
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init();`}
        </Script>
      </body>
    </html>
  );
}
