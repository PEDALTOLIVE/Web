"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { guidedTrips } from "@/lib/countries";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import TripCard from "@/components/shop-trips/TripCard";
import { useSectionVisible } from "@/hooks/useSectionVisible";

const TOPO_IMAGE = "/images/hover-topo2.svg";
// Pre-blurred raster of the same pattern for the spotlight's soft "halo"
// layer. Replaces a live CSS blur(40px) on a full-screen layer, which older
// Macs/Safari had to re-render on every mouse move (very slow there).
const TOPO_BLUR_IMAGE = "/images/hover-topo2-blur.webp";

// Fixed tile size for the topo background — repeated (not scaled to
// cover) so a single consistent pattern density tiles across the whole
// section instead of one image stretching/growing to fit it, and so it
// reaches every edge (including behind the header and any boxes on top)
// with no gaps, per explicit request.
const TOPO_TILE_SIZE = "1092px"; // 910px + 20% further, per explicit request

// Intro copy + the full trip grid, same bundling as the homepage's own
// GuidedTrips teaser module — the card markup below is intentionally the
// same one used there (image, status pill, title, price, detail lines) so
// clicking through from the homepage teaser lands on a page that looks like
// more of the same set, not a different design.
export default function TripsGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  // Asymmetric per explicit request: replays every time the module is
  // scrolled back UP into (returning from the hero above), but does NOT
  // reset just because the user keeps scrolling DOWN past it into How it
  // works — only exiting through the viewport's bottom edge (i.e. moving
  // away toward the hero) counts as "leaving" for reset purposes; exiting
  // through the top (scrolled further down, past it) is ignored so the
  // cards stay visible once you've moved on to How it works.
  // "edgeGuardedReset" mode is exactly this behaviour — see
  // useSectionVisible's own comment for the race-condition fix it now
  // also carries (cards not revealing correctly / not resetting between
  // pages, reported live, especially on mobile).
  const moduleVisible = useSectionVisible(sectionRef, { mode: "edgeGuardedReset" });

  // Same cursor-following "hero-topo2" spotlight as the homepage's Guided
  // trips / Route kits modules (see home/GuidedTrips.tsx for the full
  // rationale) — hover-topo2.svg revealed in a soft circle around the
  // pointer, sitting behind this section's own content.
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

  return (
    // pt-8 (32px) is this module's own top margin, after the hero. pb-0 —
    // the gap down to HowItWorks' title is now owned entirely by that
    // module's own top padding (pt-[76px], see HowItWorks.tsx), so the two
    // modules don't each contribute an independent, uncoordinated margin
    // that would have to be added together to hit the requested 76px.
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-neutral-100 px-6 pt-8 pb-0 md:px-8"
    >
      {/* Topographic-line background — always faintly visible (see the base layer below), with a sharper version revealed
          inside a soft circular spotlight that follows the cursor. Same
          two stacked/masked layers as the homepage modules. Present at
          every breakpoint (mobile/tablet included), same as there. */}
      {/* Always-visible faint base layer — was ONLY revealed inside the
          cursor spotlight below, which (per explicit request, backed by a
          screenshot) left most of the page showing no pattern at all
          whenever the cursor wasn't right there. This low-opacity, unmasked
          copy keeps the topo texture visible across the entire section at
          all times; the spotlight layers below still add a stronger,
          sharper reveal right around the cursor on top of it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-center opacity-[0.15]"
        style={{
          backgroundImage: `url(${TOPO_IMAGE})`,
          backgroundRepeat: "repeat",
          backgroundSize: TOPO_TILE_SIZE,
        }}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-center opacity-70"
          style={{
            backgroundImage: `url(${TOPO_BLUR_IMAGE})`,
            backgroundRepeat: "repeat",
            backgroundSize: TOPO_TILE_SIZE,
            WebkitMaskImage:
              "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), black 0%, black 40%, transparent 100%)",
            maskImage:
              "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), black 0%, black 40%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 bg-center"
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

      {/* No mx-auto/max-w-content here (was `mx-auto max-w-content`) — the
          section's own px-8 already gives the true 32px screen-edge margin,
          same convention as Shop/Sponsors on the home page; centering a
          1280px box inside that padded area added extra empty space beyond
          32px on wide screens. The title/intro box below keeps its own
          max-w-[1000px] cap for readability regardless. */}
      <div className="relative z-10">
        {/* Title + intro now share a single 1000px-wide text box (was
            max-w-2xl/672px on each independently) per explicit request. */}
        <div className="max-w-[1000px]">
          {/* Pinned to exactly 40px per explicit request (was text-h4,
              already 40px, just now spelled out literally).
              leading-[1.1] (110% line-height) on mobile only, matching
              the Kits page's own "Everything you need to ride it
              yourself" heading — sm:leading-normal reverts to the
              default at tablet/desktop, unaffected. */}
          <RevealLines
            as="h2"
            delay={0}
            show={moduleVisible}
            className="text-[40px] font-medium leading-[1.1] tracking-[-0.02em] text-dark sm:leading-normal"
          >
            Ride with someone who&rsquo;s already been there
          </RevealLines>
          <RevealLines as="p" delay={120} show={moduleVisible} className="mt-4 text-body-s text-dark/70">
            Every guided trip follows a route I&rsquo;ve ridden myself — the
            climbs, the water stops, the best sunset spots. I keep groups
            small, handle the logistics, and ride alongside you from the
            first pedal stroke to the last. You show up ready to ride;
            everything else is taken care of.
          </RevealLines>
        </div>

        {/* mt-20 (was mt-12/48px) — 32px more space after the intro
            paragraph, per explicit request. sm:grid-cols-2/lg:grid-cols-3
            (was a flat md:grid-cols-3, jumping straight from 1 to 3 with
            no tablet step) — per explicit request, tablet now gets its
            own 2-per-row breakpoint, matching the same sm:2/lg:3
            convention already used by KitsGrid.tsx and NewsGrid.tsx. */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guidedTrips.map((trip, i) => (
            <Reveal key={trip.slug} delay={240 + i * 80} show={moduleVisible}>
              <TripCard trip={trip} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
