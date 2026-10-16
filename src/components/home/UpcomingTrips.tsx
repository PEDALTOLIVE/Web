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
            <RevealLines as="p" repeat className="text-body-m text-dark">
              Upcoming trips.
            </RevealLines>
            <ul className="space-y-1 sm:space-y-2">
              {upcomingTrips.map((trip, i) => (
                <li
                  key={trip.slug}
                  ref={(el) => {
                    nameRefs.current[i] = el;
                  }}
                  className="text-h4 leading-tight text-dark transition-opacity duration-300"
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
            className="absolute right-8 top-8 z-10 w-24 aspect-[4/5] overflow-hidden rounded-2xl shadow-lg md:relative md:right-auto md:top-auto md:z-auto md:aspect-auto md:min-h-[300px] md:w-[calc(50%-16px)] md:shadow-none"
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
