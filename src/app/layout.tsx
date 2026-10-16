import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Young_Serif } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

const youngSerif = Young_Serif({
  subsets: ["latin"],
  variable: "--font-young-serif",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Pedaltolive — Aleix Mayor",
  description:
    "Real stories from endless roads, deserts and self-sufficiency on two wheels. Bikepacking routes, guides and guided trips by Aleix Mayor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable} ${youngSerif.variable}`}>
      <body className="font-sans">
        {/* The footer used to try an "overlap/reveal" effect (fixed
            position + a spacer to pull it out from behind the page) — after
            three attempts it still didn't feel right, so per explicit
            feedback it's back to plain normal document flow: no fixed
            positioning, no z-index tricks, no spacer, zero risk of ever
            covering earlier content. The sense of motion now comes from a
            parallax effect on the footer's own background image instead
            (see Footer.tsx) — the footer sits exactly where a normal last
            section would, its background just drifts at a different speed
            than its text while you scroll through it. */}
        {/* Header now lives per-page (each page.tsx renders its own,
            e.g. <Header /> or <Header variant="light" />) instead of once
            here — some pages (Guided trips, Home) open on a dark hero and
            need the default light-on-dark header, while others (Trip kits)
            open on a light hero and need it inverted. A single global
            instance here couldn't do both. */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
