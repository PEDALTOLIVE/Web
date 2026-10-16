"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { guidedTrips } from "@/lib/countries";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import TripCard from "@/components/shop-trips/TripCard";
import { useSectionVisible } from "@/hooks/useSectionVisible";

// Same topo image as the Hero (hero-topo.svg, not the tiled hover-topo2.svg
// this module used before) — per explicit request, this module now shares
// the Hero's exact background treatment: a single non-repeating image
// (bg-cover, like Hero.tsx) rather than a repeated tile.
const TOPO_IMAGE = "/images/hero-topo.svg";

export default function GuidedTrips() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgFadeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  // Bug fix, per explicit report: the topo spotlight's own opacity used to
  // be driven ONLY by hover (active), completely independent of this
  // module's scroll-driven enter/exit fade below. That meant if the
  // cursor was still hovering this section while it was mid-exit-fade
  // (dissolving back to its neutral-100 resting color as Shop arrives
  // from below), the spotlight pattern stayed at full strength on top of
  // an already-faded-out module -- reading as a stray "hero-topo" pattern
  // bleeding into Shop's own hero area once the user actually reached it.
  // topoAllowedRef/topoAllowed mirrors the interactiveRef/setInteractive
  // pattern used elsewhere: a ref for the per-frame check plus state that
  // only updates (and re-renders) the instant the module's own fade
  // crosses a "basically invisible" threshold, so the spotlight is
  // force-hidden the moment the module itself has faded away, regardless
  // of where the cursor still is.
  const topoAllowedRef = useRef(true);
  const [topoAllowed, setTopoAllowed] = useState(true);

  // Single observer for the whole module: every Reveal below is driven off
  // this one flag (via `show`), so the staggered entrance plays and resets
  // together as a group — instead of each element triggering on its own,
  // slightly different scroll position. Fires almost the instant the
  // module starts entering the viewport (threshold 0.05). See
  // useSectionVisible's own comment for the race-condition fix this now
  // carries (reveal not playing / not resetting between pages, reported
  // live, especially on mobile).
  const moduleVisible = useSectionVisible(sectionRef);

  // Same cursor-following topo spotlight as the Hero (see Hero.tsx for the
  // full rationale), just swapped to hover-topo2.svg and sitting behind
  // this section's own content instead of the Hero's.
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
    const ease = 0.1;
    const tick = () => {
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      el.style.setProperty("--mx", `${current.x}px`);
      el.style.setProperty("--my", `${current.y}px`);
      rafId = requestAnimationFrame(tick);
    };
    // Only runs while actively hovered — see Hero.tsx for the full
    // rationale (this loop used to run forever from mount regardless of
    // hover/visibility, which was competing for frame budget with the
    // module-to-module scroll glide and showing up as visible stutter).
    const handleEnter = () => {
      setActive(true);
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    const handleLeave = () => {
      setActive(false);
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

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

  // Parallax entrance for the topo background: as the module scrolls up
  // into view, the background drifts down into place from an offset
  // (--py goes from 80px to 0px) at a rate tied to scroll position rather
  // than a fixed-duration transition — independent of the foreground
  // content, which keeps its own Reveal-driven entrance. That gap between
  // how fast the background vs. the foreground settle into place is what
  // reads as parallax. (The whole-module scale/opacity/rounded-corner
  // "immersive" entrance that used to sit alongside this has been removed
  // per explicit request — this background drift is all that's left.)
  //
  // Same effect now also drives the section's own black backdrop: instead
  // of a flat bg-dark that cuts hard against a light module, bgFadeRef
  // fades in/out at whichever edge borders a light neighbor — per
  // explicit request. FADE is a fairly quick zone (30% of the viewport).
  //
  // Since the home module order was swapped (this module now sits
  // directly below Upcoming trips, above Route kits — was the other way
  // around), only the BOTTOM edge needs a fade any more: Upcoming trips
  // (above) is dark, matching this module's own dark backdrop, so no
  // fade-in is needed there — bgFadeRef simply stays fully opaque from
  // the top. Route kits (below) is light, so the fade-out into it is kept
  // as before: it starts the instant Route kits begins appearing at the
  // bottom of the viewport (this section's own bottom edge — the same
  // line as Route kits' top edge, since they're adjacent — touching the
  // viewport's bottom edge) and finishes 30% of a viewport height later.
  // contentRef (the actual title/description/cards) fades on this exact
  // same value as the backdrop, so the whole module — color and content
  // together — dissolves in sync as Route kits rises up underneath it.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (bgFadeRef.current) bgFadeRef.current.style.opacity = "1";
      return;
    }

    const FADE = 0.3;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 while the section's top hasn't reached the viewport yet, 1 once
      // its top has scrolled past the top of the viewport.
      const progress = Math.min(1, Math.max(0, 1 - rect.top / vh));
      el.style.setProperty("--py", `${(1 - progress) * 80}px`);

      const exit = 1 - Math.min(1, Math.max(0, (vh - rect.bottom) / (vh * FADE)));
      const visibility = exit;
      const opacity = String(visibility);
      if (bgFadeRef.current) bgFadeRef.current.style.opacity = opacity;
      if (contentRef.current) contentRef.current.style.opacity = opacity;

      // See the topoAllowedRef comment above: force the spotlight off
      // once the module itself is basically invisible, independent of
      // hover state.
      const shouldAllowTopo = visibility > 0.05;
      if (shouldAllowTopo !== topoAllowedRef.current) {
        topoAllowedRef.current = shouldAllowTopo;
        setTopoAllowed(shouldAllowTopo);
      }
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
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
      // py-[100px] top/bottom (was py-8/32px) originally. Bottom is now
      // 64px — another -20% (was 80px, itself already -20% from 100px)
      // per a further explicit request to keep tightening the gap into
      // Route kits below. Top stays 100px, that edge (against Upcoming
      // trips) still isn't part of this request.
      // bg-neutral-100 (same gray as Route kits / Shop) sits *under* the
      // bgFadeRef dark overlay below as the section's own resting color —
      // it was missing before, so as bgFadeRef faded out on the way into
      // Route kits, the section briefly showed the page's own white
      // background (body's bg-light) instead of blending into its
      // matching gray.
      className="relative flex flex-col justify-center overflow-hidden bg-neutral-100 pt-[100px] pb-[64px] text-light"
    >
      {/* The section's own black backdrop — was a flat bg-dark on the
          section itself, now this separate layer so its opacity can be
          scroll-driven (see the effect above): fades in as the module
          arrives, fades back out as it leaves, instead of cutting hard
          against the light module before/after it. Sits behind the topo
          pattern (below), which needs a dark backdrop of its own to read
          against. */}
      <div
        ref={bgFadeRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-dark"
        style={{ opacity: 0 }}
      />
      {/* Topographic-line background — hidden by default, only revealed
          inside a soft circular spotlight that follows the cursor, exactly
          like the Hero (the always-visible faint base layer that used to
          sit here has been removed per explicit request — now nothing
          shows until the cursor is over the section). Sits behind
          everything else in the section.
          -top-20 (-80px) instead of inset-0's plain 0, with bottom-0 in
          place of the missing bottom inset, per explicit request to fix a
          real gap at the top of the module: --py above drifts this layer
          down by up to 80px as the module scrolls into view (the parallax
          entrance), and inset-0 sized this box exactly to the section's own
          bounds, so translating it down by up to 80px left the top 80px of
          the section showing nothing from this layer (just the plain dark
          backdrop behind it) until the parallax had fully settled. Extending
          this box 80px upward — the exact max translateY distance — means
          it always still fully covers the section's real top edge at every
          point along that slide, gap gone. bg-cover on the image layers
          below just covers this now-taller box the same way, no visible
          difference to the pattern itself. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-20 inset-x-0 bottom-0 z-0 transition-opacity duration-500 ${
          active && topoAllowed ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: "translateY(var(--py, 0px))" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 blur-2xl"
          style={{
            backgroundImage: `url(${TOPO_IMAGE})`,
            WebkitMaskImage:
              "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), black 0%, black 40%, transparent 100%)",
            maskImage:
              "radial-gradient(circle 320px at var(--mx, 50%) var(--my, 50%), black 0%, black 40%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${TOPO_IMAGE})`,
            WebkitMaskImage:
              "radial-gradient(circle 160px at var(--mx, 50%) var(--my, 50%), black 0%, black 55%, transparent 100%)",
            maskImage:
              "radial-gradient(circle 160px at var(--mx, 50%) var(--my, 50%), black 0%, black 55%, transparent 100%)",
          }}
        />
      </div>

      {/* Top-edge vignette, per explicit request: the cursor-spotlight topo
          pattern above can end in a visibly hard edge right at the
          module's own top boundary (the mask is a plain circle, so
          whenever it's near that edge — e.g. while the module is still
          scrolling into view and the pointer happens to be up there — the
          circle gets flatly clipped by the section instead of fading out
          naturally). This static gradient sits above the topo layer and
          the flat dark backdrop but below the real content, and simply
          dissolves anything underneath it into solid dark near the top
          — regardless of the spotlight's current position — so there's
          never a hard cut to see in the first place. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-40 bg-gradient-to-b from-dark to-transparent sm:h-56"
      />

      <div ref={contentRef} className="relative z-10 w-full px-6 md:px-8">
        <div className="flex flex-col items-start">
          {/* Young Serif 52px (font-serif text-h1) — matches Route
              kits' own title treatment. No more eyebrow label above it
              (removed per explicit request), so this is the first thing
              in the module now, delay=0. */}
          <RevealLines
            as="h2"
            delay={0}
            show={moduleVisible}
            className="max-w-[864px] font-serif text-h1 text-light"
          >
            Guided trips the Pedaltolive way.
          </RevealLines>
          <RevealLines as="p" delay={120} show={moduleVisible} className="mt-4 max-w-[768px] text-body-s text-light">
            Small-group, fully-guided bikepacking trips through the
            countries I&rsquo;ve already ridden myself: Indonesia, Thailand,
            Gambia, Colombia, Oman, Morocco, Cambodia, and more to come.
            Everything included.
          </RevealLines>
          <Reveal
            delay={240}
            show={moduleVisible}
            className="mt-6 w-fit self-end"
          >
            <Link href="/shop-trips" className="group flex w-fit items-center gap-4">
              <span className="font-mono text-detail-m uppercase text-light">
                View more
              </span>
              {/* Default / hover / pressed states per the attached design:
                  burnt-orange primary at rest, sage green on hover, a
                  darker olive green while pressed. */}
              <span className="flex shrink-0 items-center justify-center rounded-[6.4px] bg-primary px-[12.8px] py-[12.8px] text-light transition-colors duration-300 group-hover:bg-[#A9B89C] group-active:bg-[#657755]">
                <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 2l4 4-4 4" />
                </svg>
              </span>
            </Link>
          </Reveal>
        </div>

        {/* 3 most-featured trips on the home teaser (was 2, narrower
            cards per explicit request so 3 fit the same width) — the full
            set lives on /shop-trips (linked by "View more" above). */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {guidedTrips.slice(0, 3).map((trip, i) => (
            <Reveal
              key={trip.slug}
              delay={360 + i * 120}
              show={moduleVisible}
            >
              <TripCard trip={trip} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
