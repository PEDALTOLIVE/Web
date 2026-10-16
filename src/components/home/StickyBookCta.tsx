"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Small CTA fixed at the bottom of the viewport, present through the whole
// home page (mounted once in home/page.tsx, alongside all the other home
// modules) so it's always reachable no matter how far the visitor has
// scrolled — on top of the hero's own "Book your trip" button, which only
// lives in the first screen. z-40 keeps it below the header (z-50) and the
// mobile nav overlay (z-100).
//
// Only shown once the user has scrolled past the hero (#home-hero, see
// Hero.tsx) — an IntersectionObserver on that section flips `visible` the
// moment it's no longer on screen, rather than showing this the whole
// time (which would just duplicate the hero's own CTA right next to it).
export default function StickyBookCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("home-hero");
    if (!hero) {
      // No hero found for some reason — fail open rather than hiding the
      // CTA forever.
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-6 z-40 flex justify-center px-6 transition-all duration-300 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {/* Back to .btn-primary's own orange fill / white text, no border —
          per explicit request, reverting the white-fill/orange-text/
          orange-stroke version from before. */}
      <Link
        href="/shop-trips"
        className="btn-primary !rounded-[8px] !px-5 !py-3 !text-detail-s shadow-lg shadow-dark/20"
      >
        Book your trip
      </Link>
    </div>
  );
}
