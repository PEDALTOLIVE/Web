"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import TripCard from "@/components/shop-trips/TripCard";
import { guidedTrips, type GuidedTrip, type IncludedIconKey } from "@/lib/countries";

// Dark-hero topo pattern (was hover-topo2.svg on the light-variant product
// page for Kits) — this page follows the Guided trips pages' own dark
// bg-dark/text-light treatment (see shop-trips/Hero.tsx), so it gets the
// same "hero-topo" asset those use, not the light-page one, per explicit
// request.
const TOPO_IMAGE = "/images/hero-topo.svg";
// Fixed tile size for the page-wide topo background — repeated (not scaled
// to cover) so a single consistent pattern density tiles across the whole
// page height instead of one image stretching/growing to fit it, per
// explicit request.
const TOPO_TILE_SIZE = "910px"; // 700px + 30%, per explicit request

function ChevronLeft() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L4 6l4 4" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2l4 4-4 4" />
    </svg>
  );
}

// One icon per "What's included" feature category (was a generic checkmark
// in a filled square — per explicit request, each line now gets an icon
// that actually references what it is, not a checkbox).
const INCLUDED_ICONS: Record<IncludedIconKey, React.ReactNode> = {
  guide: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M5.5 17.5 10 8h3.5l3 5.5M10 8h4.5M9 17.5h6" />
    </svg>
  ),
  stay: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 15h18" />
      <path d="M7 10V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3" />
      <path d="M3 18v2M21 18v2" />
    </svg>
  ),
  meals: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v6a2 2 0 0 0 4 0V3M10 11v10" />
      <path d="M16 3v7c0 1.5 1 2.5 2 2.5V21" />
    </svg>
  ),
  mechanic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 6.5a4 4 0 0 0-5.4 4.9L4 16.5V20h3.5l5.1-5.1a4 4 0 0 0 4.9-5.4l-2.6 2.6-2-2z" />
    </svg>
  ),
  transfer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16v-4l2-5h12l2 5v4" />
      <path d="M4 16h16" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  ),
  ferry: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 15l2 5h14l2-5" />
      <path d="M6 15V9h12v6" />
      <path d="M12 9V4" />
    </svg>
  ),
  vehicle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17V9a1 1 0 0 1 1-1h9l4 4v5" />
      <path d="M3 17h14" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="16" cy="18" r="1.6" />
    </svg>
  ),
  route: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  ),
  insurance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" />
      <path d="M9.5 12 11.3 13.8 15 10" />
    </svg>
  ),
  group: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2c2.4.4 4.3 2.4 4.5 4.8" />
    </svg>
  ),
};

export default function TripDetail({ trip }: { trip: GuidedTrip }) {
  // Tracks cursor position across the WHOLE page section again (was scoped
  // to just the hero block) — per explicit request the topo spotlight is
  // back to being available anywhere on the page, this time as a tiled
  // pattern (see TOPO_TILE_SIZE) instead of one image stretched/scaled to
  // cover the full, much-taller-than-the-hero section.
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let initialized = false;
    let rafId = 0;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      if (!initialized) {
        current.x = target.x;
        current.y = target.y;
        initialized = true;
      }
    };
    const handleEnter = () => setActive(true);
    const handleLeave = () => setActive(false);

    const ease = 0.1;
    const tick = () => {
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      el.style.setProperty("--mx", `${current.x}px`);
      el.style.setProperty("--my", `${current.y}px`);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  // Clicking a gallery thumbnail swaps the main photo above it — same small
  // addition as the Kit detail page's own gallery.
  const [mainImage, setMainImage] = useState(trip.image);
  const gallery = trip.gallery ?? [];

  const specs = [
    trip.days ? { label: "Duration", value: `${trip.days} days` } : null,
    { label: "Group size", value: `Max ${trip.maxRiders} riders` },
    { label: "Difficulty", value: "★".repeat(trip.difficulty) + "☆".repeat(5 - trip.difficulty) },
  ].filter((spec): spec is { label: string; value: string } => Boolean(spec));

  // Two other guided trips, excluding this one — same TripCard used on the
  // homepage teaser and shop-trips/TripsGrid.tsx so this reads as more of
  // the same set.
  const related = guidedTrips.filter((t) => t.slug !== trip.slug).slice(0, 2);

  return (
    // No overflow-hidden on this outer section: the tiled topo background
    // below fills its own bounds exactly (no oversized/scaled image bleeding
    // past the edges the way the old bg-cover version needed contained), and
    // an overflow-hidden ancestor here would silently break the sidebar's
    // position:sticky below (a scroll-ancestor with overflow other than
    // visible clips sticky descendants).
    <section ref={sectionRef} className="relative bg-dark px-6 pb-24 pt-24 text-light md:px-8 md:pt-28">
      {/* Topographic-line background — invisible by default, revealed only
          inside a soft circular spotlight that follows the cursor, now
          spanning the whole page section (was confined to just the hero
          block above the fold). backgroundRepeat: "repeat" + a fixed
          TOPO_TILE_SIZE (was bg-cover bg-center, one copy of the image
          stretched to fill the section) means the pattern tiles at a
          constant scale no matter how tall the page is, instead of growing
          to cover it. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 opacity-70 blur-2xl"
          style={{
            backgroundImage: `url(${TOPO_IMAGE})`,
            backgroundRepeat: "repeat",
            backgroundSize: TOPO_TILE_SIZE,
            WebkitMaskImage:
              "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), black 0%, black 40%, transparent 100%)",
            maskImage:
              "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), black 0%, black 40%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${TOPO_IMAGE})`,
            backgroundRepeat: "repeat",
            backgroundSize: TOPO_TILE_SIZE,
            WebkitMaskImage:
              "radial-gradient(circle 160px at var(--mx, 50%) var(--my, 50%), black 0%, black 55%, transparent 100%)",
            maskImage:
              "radial-gradient(circle 160px at var(--mx, 50%) var(--my, 50%), black 0%, black 55%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10">
        <Reveal immediate delay={0}>
          <Link
            href="/shop-trips"
            className="inline-flex items-center gap-2 font-mono text-detail-m uppercase text-light/60 transition-colors duration-300 hover:text-light"
          >
            <ChevronLeft />
            Back to trips
          </Link>
        </Reveal>

        <RevealLines as="h1" immediate delay={80} className="mt-8 font-serif text-h1 lg:text-display-2">
          {trip.location}
        </RevealLines>

        {/* Gallery — one large photo, plus (when present) a 3-up set beside
            it: the first thumbnail spans the full width of that column, the
            other two sit side by side beneath it, matching the attached
            design. Stacks to a single column on mobile. */}
        <Reveal immediate delay={160} className="mt-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr]">
            <div
              className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cover bg-center transition-[background-image] duration-300 sm:aspect-auto"
              style={{ backgroundImage: `url(${mainImage})` }}
            />
            {gallery.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setMainImage(src)}
                    aria-label={`View photo ${i + 2} of ${trip.location}`}
                    className={`aspect-[4/3] overflow-hidden rounded-xl bg-cover bg-center ${
                      i === 0 ? "col-span-2" : ""
                    } ${
                      mainImage === src ? "ring-2 ring-light ring-offset-2 ring-offset-dark" : ""
                    }`}
                    style={{ backgroundImage: `url(${src})` }}
                  />
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Content left (wide) + price/CTA sidebar right (narrow) — the
            sidebar is sticky from lg up (per explicit request: it stays in
            view while the longer content column scrolls past) and an
            ordinary inline card above the content on mobile/tablet, where
            there's no room for a side-by-side sticky column. lg:top-28
            clears the fixed header with a little breathing room.
            lg:gap-[120px] (was lg:gap-16/64px) — per explicit request. */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-[120px]">
          <div className="order-2 flex flex-col gap-14 lg:order-1">
            {trip.about && (
              <Reveal delay={0} repeat>
                <div>
                  <RevealLines as="h2" repeat className="text-h4">
                    About this trip
                  </RevealLines>
                  <RevealLines as="p" repeat delay={60} className="mt-4 text-body-s text-light/70">
                    {trip.about}
                  </RevealLines>
                </div>
              </Reveal>
            )}

            {trip.included && trip.included.length > 0 && (
              <Reveal delay={0} repeat>
                <div>
                  <RevealLines as="h2" repeat className="text-h4">
                    What&rsquo;s included
                  </RevealLines>
                  <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {trip.included.map((item) => (
                      <li key={item.text} className="flex items-start gap-3 text-body-s text-light/70">
                        <span className="mt-0.5 h-5 w-5 flex-none text-primary">
                          {INCLUDED_ICONS[item.icon]}
                        </span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            {trip.whatMakesSpecial && (
              <Reveal delay={0} repeat>
                <div>
                  <RevealLines as="h2" repeat className="text-h4">
                    What makes this trip special
                  </RevealLines>
                  <RevealLines as="p" repeat delay={60} className="mt-4 text-body-s text-light/70">
                    {trip.whatMakesSpecial.text}
                  </RevealLines>
                  <div
                    className="mt-6 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${trip.whatMakesSpecial.image})` }}
                  />
                </div>
              </Reveal>
            )}

            {trip.datesBlurb && (
              <Reveal delay={0} repeat>
                <div>
                  <RevealLines as="h2" repeat className="text-h4">
                    Dates
                  </RevealLines>
                  <RevealLines as="p" repeat delay={60} className="mt-4 text-body-s text-light/70">
                    {trip.datesBlurb}
                  </RevealLines>
                </div>
              </Reveal>
            )}

            {trip.team && (
              <Reveal delay={0} repeat>
                <div>
                  <RevealLines as="h2" repeat className="text-h4">
                    Team
                  </RevealLines>
                  {/* Two-column layout: name/role/bio in a left text column,
                      large portrait photo alongside on the right. items-stretch
                      (was lg:items-start) so both columns share the photo's
                      height on lg, and lg:mt-auto on the bio (was a fixed
                      mt-8) pushes it down so its own bottom lines up with the
                      photo's bottom — the gap between the role and the bio
                      grows or shrinks with the photo's height instead of
                      staying fixed, per explicit request. */}
                  <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
                    <div className="flex flex-col lg:h-full">
                      <div>
                        <p className="text-body-m font-medium text-light">{trip.team.name}</p>
                        <p className="mt-2 text-body-s text-light/50">{trip.team.role}</p>
                      </div>
                      <p className="mt-8 text-body-s text-light/70 lg:mt-auto">{trip.team.bio}</p>
                    </div>
                    <div
                      className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cover bg-center"
                      style={{ backgroundImage: `url(${trip.team.avatar})` }}
                    />
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* Sticky price/CTA sidebar — no border/background panel (was a
              bordered bg-light/5 card) per explicit request, so the specs
              list, price and button now sit directly on the page background
              like the attached design, with just the per-row dividers
              carrying the visual structure. */}
          <Reveal
            delay={80}
            repeat
            className="order-1 lg:sticky lg:top-28 lg:order-2"
          >
            <div className="flex flex-col gap-6">
              {specs.length > 0 && (
                <div className="flex flex-col">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between gap-4 border-b border-light/15 py-4 first:pt-0"
                    >
                      {/* IBM Plex Mono Regular 14px for both the label
                          and the value, per explicit request — text-detail-s
                          bakes in a 500 weight, so both are set explicitly
                          instead (text-[14px] font-normal). */}
                      <span className="font-mono text-[14px] font-normal lowercase text-light/50">
                        {spec.label}
                      </span>
                      {/* Difficulty's star rating gets its own 50%-larger
                          size (14px -> 21px, was sharing text-detail-s with
                          every other spec value) — per explicit request,
                          the stars specifically, not the other rows. */}
                      <span
                        className={`font-mono font-normal lowercase text-light ${
                          spec.label === "Difficulty" ? "text-[21px]" : "text-[14px]"
                        }`}
                      >
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-body-m text-light">
                from{" "}
                <span className="font-semibold">
                  €{trip.priceFrom.toLocaleString("en-US")}
                </span>
              </p>
              {/* hover/active states matched to the rest of the site's
                  btn-primary CTAs (see shop-trips/HowItWorks.tsx's own "Get
                  in touch"). */}
              <Link
                href="/contact"
                className="btn-primary w-full hover:bg-[#A9B89C] active:bg-[#657755]"
              >
                Get in touch
                <ChevronRight />
              </Link>
            </div>
          </Reveal>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <Reveal delay={0} repeat>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <RevealLines
                    as="h2"
                    delay={0}
                    repeat
                    className="text-[40px] font-medium tracking-[-0.02em] leading-tight lg:text-h2"
                  >
                    You may also like
                  </RevealLines>
                  <p className="mt-2 max-w-md text-body-s text-light/70">
                    More small-group trips, if this one isn&rsquo;t quite the
                    dates or region you&rsquo;re after.
                  </p>
                </div>
                <Link
                  href="/shop-trips"
                  className="btn-primary w-fit hover:bg-[#A9B89C] active:bg-[#657755]"
                >
                  See all
                  <ChevronRight />
                </Link>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {related.map((t, i) => (
                <Reveal key={t.slug} delay={80 + i * 80} repeat>
                  <TripCard trip={t} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
