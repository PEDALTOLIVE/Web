import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Hero from "@/components/shop-kits/Hero";
import KitsGrid from "@/components/shop-kits/KitsGrid";

export const metadata: Metadata = {
  title: "Trip Kits — Pedaltolive",
  description:
    "GPS tracks, route guides and honest practical tips for the countries Aleix Mayor has already bikepacked — download once, ride whenever you're ready.",
};

export default function ShopKitsPage() {
  return (
    <>
      {/* variant="light" — this page's Hero has a light background (unlike
          Home/Guided trips), so the header needs dark text/logo instead of
          the default light-on-dark. See Header.tsx's own comment. */}
      <Header variant="light" />
      {/* min-h-dvh (the *dynamic* viewport height, not min-h-screen's fixed
          100vh — same reasoning as the home Hero: it tracks the real,
          currently-visible viewport instead of the largest possible one,
          so this isn't thrown off by a mobile browser's address bar/
          toolbar) so the page always fills at least one full screen before
          the Footer, per explicit request — with only a handful of kits,
          this page's own content could otherwise end well short of the
          viewport height, leaving the Footer sitting high up instead of at
          the bottom of the screen. KitsGrid grows via flex-1 (see its own
          className) to absorb that leftover space instead of leaving a
          gap of plain background below the cards. */}
      <div className="flex min-h-dvh flex-col">
        <Hero />
        <KitsGrid />
      </div>
    </>
  );
}
