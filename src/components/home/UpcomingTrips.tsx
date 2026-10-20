"use client";

import { useEffect, useRef } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import { upcomingTrips } from "@/lib/countries";

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// A pinned scrollytelling list, the same beat as the globe module's line
// spotlight: as the user scrolls through this section, each country name in
// the left card "lights up" in turn while the photo on the right crossfades
// to match, so the image always shows whichever country is currently
// highlighted. Position-driven via refs (not React state) so it stays smooth.
export default function UpcomingTrips() {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRefs = useRef<Array<HTMLLIElement | null>>([]);
  const imageRefs = useRef<Array<HTMLDivElement | null>>([]);
  // Mobile-only copy of the photos, laid out inside the white card itself
  // (see the JSX below) — driven by the same active index.
  const mobileImageRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const n = upcomingTrips.length;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      // A little settle margin at each end so the very first and last
      // country both get a comfortable, fully-lit dwell instead of being
      // caught mid-transition right as the section pins or unpins.
      const local = smoothstep(0.04, 0.96, p);

      // Which country is "lit" right now — a hard on/off switch rather than
      // a gradual brightness ramp, so exactly one name/photo is highlighted
      // at any scroll position with no partially-lit in-between states.
      const activeIndex = n > 1 ? Math.round(local * (n - 1)) : 0;

      for (let i = 0; i < n; i++) {
        const isActive = i === activeIndex;

        const nameEl = nameRefs.current[i];
        if (nameEl) nameEl.style.opacity = isActive ? "1" : "0.16";

        const imgEl = imageRefs.current[i];
        if (imgEl) imgEl.style.opacity = isActive ? "1" : "0";

        const mobileImgEl = mobileImageRefs.current[i];
        if (mobileImgEl) mobileImgEl.style.opacity = isActive ? "1" : "0";
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-dark"
      // Per explicit request to require less scroll action across the
      // whole home, the per-item scroll allowance is cut from 42vh to
      // 28vh (and the base from 100vh to 70vh) — about a 33% shorter
      // total scroll distance for this module, same proportions
      // (0.04–0.96 settle margins) so each country still gets a full,
      // comfortable dwell.
      style={{ height: `${70 + upcomingTrips.length * 28}vh` }}
    >
      {/* p-8 here (not items-center + inner padding) is the single source of
          the module's 32px margin on every side, at every breakpoint — the
          content below stretches edge-to-edge inside that padded box
          instead of being an intrinsically-sized block centered within it. */}
      <div className="sticky top-0 flex h-screen w-full overflow-hidden px-6 py-8 md:px-8">
        <div className="relative flex h-full w-full flex-col gap-4 md:flex-row md:gap-8">
          {/* p-8 (32px) on mobile, back up to p-12 (48px) at md — the
              interior margin only shrinks on the small screen, desktop
              keeps its existing 48px. */}
          {/* Reveal (was a plain div) — a subtle fade-up as this pinned
              module first scrolls into view, per explicit request; the
              scroll-driven opacity the list items already manage via
              nameRefs (below) is untouched, since that lives on the <li>
              elements themselves, one layer inside this wrapper's own
              fade/translate. repeat added per a later explicit request —
              without it this fade-up only ever played once, the very
              first time the module was scrolled into view, and then
              stayed permanently visible; with it, leaving the module and
              scrolling back in (in either direction) replays the fade-up
              instead of the cards just sitting there already fully shown. */}
          <Reveal repeat className="flex h-full w-full flex-col justify-between rounded-2xl bg-light p-8 md:w-[calc(50%-16px)] md:p-12">
            {/* Title row: "Upcoming trips." + an Instagram icon link at the
                top-right of the white card (per explicit request). */}
            <div className="flex items-start justify-between gap-4">
              <RevealLines as="p" repeat className="text-body-m text-dark">
                Upcoming trips.
              </RevealLines>
              <a
                href="https://www.instagram.com/pedaltolive/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow @pedaltolive on Instagram"
                className="shrink-0 text-dark transition-colors duration-300 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" clipRule="evenodd" d="M4 0C1.79086 0 0 1.79086 0 4V20C0 22.2091 1.79086 24 4 24H20C22.2091 24 24 22.2091 24 20V4C24 1.79086 22.2091 0 20 0H4ZM15.2327 5.48809C14.3891 5.4496 14.1361 5.44147 12 5.44147C9.86388 5.44147 9.61088 5.4496 8.76728 5.48809C7.98732 5.52369 7.56373 5.65401 7.28183 5.76354C6.90841 5.90867 6.64188 6.08205 6.36195 6.36198C6.08202 6.64191 5.90863 6.90844 5.76354 7.28183C5.65398 7.56376 5.52366 7.98735 5.48806 8.76735C5.44957 9.61091 5.44144 9.86391 5.44144 12C5.44144 14.1361 5.44957 14.3891 5.48806 15.2327C5.52366 16.0127 5.65398 16.4363 5.76354 16.7182C5.90863 17.0916 6.08202 17.3581 6.36195 17.638C6.64188 17.918 6.90841 18.0914 7.28183 18.2365C7.56373 18.346 7.98732 18.4763 8.76731 18.5119C9.61075 18.5504 9.86375 18.5586 12 18.5586C14.1362 18.5586 14.3892 18.5504 15.2327 18.5119C16.0126 18.4763 16.4362 18.346 16.7182 18.2365C17.0916 18.0914 17.3581 17.918 17.638 17.638C17.9179 17.3581 18.0913 17.0916 18.2364 16.7182C18.346 16.4363 18.4763 16.0127 18.5119 15.2327C18.5504 14.3891 18.5585 14.1361 18.5585 12C18.5585 9.86391 18.5504 9.61091 18.5119 8.76731C18.4763 7.98735 18.346 7.56376 18.2364 7.28183C18.0913 6.90844 17.9179 6.64191 17.638 6.36198C17.3581 6.08205 17.0916 5.90867 16.7182 5.76354C16.4362 5.65401 16.0126 5.52369 15.2327 5.48809ZM8.70161 4.04814C9.5549 4.00921 9.8273 4 12 4C14.1727 4 14.4451 4.00921 15.2984 4.04814C16.1499 4.08701 16.7314 4.22223 17.2403 4.42001C17.7664 4.62445 18.2125 4.898 18.6573 5.34274C19.102 5.78748 19.3755 6.23363 19.58 6.7597C19.7778 7.26859 19.913 7.8501 19.9519 8.70164C19.9908 9.5549 20 9.82733 20 12C20 14.1727 19.9908 14.4451 19.9519 15.2984C19.913 16.1499 19.7778 16.7314 19.58 17.2403C19.3755 17.7664 19.102 18.2125 18.6573 18.6573C18.2125 19.102 17.7664 19.3756 17.2403 19.58C16.7314 19.7778 16.1499 19.913 15.2984 19.9519C14.4451 19.9908 14.1727 20 12 20C9.8273 20 9.5549 19.9908 8.70161 19.9519C7.85007 19.913 7.26856 19.7778 6.75966 19.58C6.23359 19.3756 5.78745 19.102 5.34271 18.6573C4.89797 18.2125 4.62442 17.7664 4.41997 17.2403C4.2222 16.7314 4.08698 16.1499 4.04811 15.2984C4.00918 14.4451 4 14.1727 4 12C4 9.82733 4.00918 9.5549 4.04811 8.70164C4.08698 7.8501 4.2222 7.26859 4.41997 6.7597C4.62442 6.23363 4.89797 5.78748 5.34271 5.34274C5.78745 4.898 6.23359 4.62445 6.75966 4.42001C7.26856 4.22223 7.85007 4.08701 8.70161 4.04814ZM7.89186 12C7.89186 9.73117 9.73114 7.89189 12 7.89189C14.2688 7.89189 16.1081 9.73117 16.1081 12C16.1081 14.2689 14.2688 16.1081 12 16.1081C9.73114 16.1081 7.89186 14.2689 7.89186 12ZM9.3333 12C9.3333 13.4728 10.5272 14.6667 12 14.6667C13.4727 14.6667 14.6667 13.4728 14.6667 12C14.6667 10.5273 13.4727 9.33333 12 9.33333C10.5272 9.33333 9.3333 10.5273 9.3333 12ZM16.2704 8.68961C16.8006 8.68961 17.2304 8.25979 17.2304 7.72959C17.2304 7.19939 16.8006 6.7696 16.2704 6.7696C15.7402 6.7696 15.3104 7.19939 15.3104 7.72959C15.3104 8.25979 15.7402 8.68961 16.2704 8.68961Z" />
              </svg>
              </a>
            </div>
            {/* Mobile only: the photo now sits inside the card, between the
                title and the list, filling all the free space there
                (flex-1, min-h-0 so it shrinks on short screens instead of
                pushing the list out) — much bigger than the old 96px corner
                thumbnail, and it can never cover the title. */}
            <div className="relative my-6 min-h-0 flex-1 overflow-hidden rounded-xl md:hidden">
              {upcomingTrips.map((trip, i) => (
                <div
                  key={trip.slug}
                  ref={(el) => {
                    mobileImageRefs.current[i] = el;
                  }}
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
                  style={{ backgroundImage: `url(${trip.image})`, opacity: i === 0 ? 1 : 0 }}
                />
              ))}
            </div>
            <ul className="space-y-1 sm:space-y-2">
              {upcomingTrips.map((trip, i) => (
                <li
                  key={trip.slug}
                  ref={(el) => {
                    nameRefs.current[i] = el;
                  }}
                  className="text-[28px] font-medium tracking-[-0.02em] leading-tight text-dark transition-opacity duration-300 md:text-h4 md:leading-tight"
                  style={{ opacity: 0.16 }}
                >
                  {trip.name}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Mobile: an inset thumbnail pinned 32px from the card's own top
              and right edges (right-8/top-24 -> right-8/top-8 — the wrapper
              this is absolutely positioned in is edge-to-edge with the white
              card at this breakpoint, since the card is w-full with no
              horizontal offset from it, so right-8/top-8 here reads as
              32px from the card's own edges). w-24 (was w-36 — shrunk per
              explicit feedback that it was covering the "Upcoming trips."
              title text underneath it) + aspect-[4/5] keeps the thumbnail
              portrait-shaped — the auto height is just width * 5/4.
              Desktop: becomes the separate right-hand photo card via the
              md: overrides (md:aspect-auto cancels the mobile aspect ratio
              so md:min-h-[300px] governs the height there, same as before). */}
          <Reveal
            repeat
            delay={120}
            // Desktop only now — the separate right-hand photo card. On
            // mobile the photo lives inside the white card instead (above).
            className="relative hidden min-h-[300px] w-[calc(50%-16px)] overflow-hidden rounded-2xl md:block"
          >
            {upcomingTrips.map((trip, i) => (
              <div
                key={trip.slug}
                ref={(el) => {
                  imageRefs.current[i] = el;
                }}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
                style={{ backgroundImage: `url(${trip.image})`, opacity: i === 0 ? 1 : 0 }}
              />
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
