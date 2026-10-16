"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import { placeholderImage } from "@/lib/placeholder";

const TOPO_IMAGE = "/images/hover-topo2.svg";

// Fixed tile size for the topo background — repeated (not scaled to
// cover) so a single consistent pattern density tiles across the whole
// section instead of one image stretching/growing to fit it, and so it
// reaches every edge (including behind the header and any boxes on top)
// with no gaps, per explicit request.
const TOPO_TILE_SIZE = "1092px"; // 910px + 20% further, per explicit request

// Light-background hero (unlike Guided trips' full-screen dark one) — per
// the attached design, this page reads as one continuous light page from
// top to bottom, so this section shares the same bg-neutral-100 as
// KitsGrid below it instead of a dark block. pt-24/md:pt-28 mirrors the
// home Hero's own clearance for the absolute-positioned Header (73px
// tall) — see app/shop-kits/page.tsx, which renders Header with
// variant="light" so its text stays legible against this light bg.
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  // Same cursor-following "hover-topo2" spotlight as the homepage's Guided
  // trips / Route kits modules (see home/GuidedTrips.tsx for the full
  // rationale) — per explicit request, this now runs across the whole
  // shop-kits page (this Hero and KitsGrid below both get their own
  // instance, scoped to their own section, matching the established
  // per-section pattern used everywhere else this effect appears).
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
    <section
      ref={sectionRef}
      // pb-[76px] (was pb-8/32px) — the exact requested gap from this
      // section's photo down to KitsGrid's title, now that KitsGrid's own
      // eyebrow (which used to sit above that title) is gone.
      className="relative overflow-hidden bg-neutral-100 px-6 pb-[76px] pt-24 text-dark md:px-8 md:pt-28"
    >
      {/* Topographic-line background — same cursor-following spotlight as
          Guided trips/Route kits, sitting behind everything else in the
          section. */}
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
          className="absolute inset-0 bg-center opacity-70 blur-2xl"
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

      <div className="relative z-10">
        {/* Left-aligned (was items-center/text-center) — per the attached
            design, this hero's badge/title/subtitle and the photo below it
            all sit flush with the page's left margin instead of being
            centered. */}
        <div className="flex flex-col items-start gap-4 text-left">
          <Reveal immediate delay={0}>
            <span className="inline-block rounded-full bg-primary px-3 py-1 font-mono text-detail-s uppercase text-light">
              Route kits
            </span>
          </Reveal>
          {/* font-serif text-h1 lg:text-display-2 = Young Serif at 52px on
              mobile/tablet, 80px on desktop (lg). w-full max-w-none on
              mobile (was w-[150%] — that overflowed past the section's own
              right padding, and since the section clips overflow, part of
              a wrapped line could end up cut off past the screen edge;
              per explicit correction this now fits the real screen width
              and respects the normal 32px margins). sm:w-auto sm:max-w-2xl
              keeps the natural capped column from tablet up, unaffected. */}
          <RevealLines
            as="h1"
            immediate
            delay={120}
            className="w-full max-w-none font-serif text-h1 sm:w-auto sm:max-w-2xl lg:max-w-[874px] lg:text-display-2"
          >
            Route kits the Pedaltolive way
          </RevealLines>
          {/* text-dark/70 (not text-secondary, which is a warm cream tuned
              for dark backgrounds like the Guided trips hero) — this hero
              sits on a light background, so the muted-body-text convention
              used elsewhere on light sections (e.g. TripsGrid's own
              paragraph) applies here instead. w-full max-w-none on mobile,
              same correction as the title above (was w-[150%], overflowing
              past the screen edge); lg:max-w-[874px]/[749px] on this and
              the title above are each +30% over their previous desktop
              caps (672px→874px, 576px→749px), per an earlier request. */}
          <RevealLines
            as="p"
            immediate
            delay={240}
            className="w-full max-w-none text-body-s text-dark/70 sm:w-auto sm:max-w-xl lg:max-w-[749px]"
          >
            GPS tracks, route guides and honest practical tips from the
            countries I&rsquo;ve already ridden myself — download once, ride
            whenever you&rsquo;re ready.
          </RevealLines>
        </div>

        {/* Full-bleed (spans the whole page width). aspect-[4/3] mobile,
            sm:aspect-[16/9] tablet; at desktop a fixed 494px height (was
            aspect-[35/1], which scaled the height with the viewport width —
            per explicit request this is now a flat 494px regardless of
            width, still full-bleed). */}
        <Reveal immediate delay={360} className="mt-16">
          <div
            className="aspect-[4/3] w-full rounded-2xl bg-cover bg-center sm:aspect-[16/9] lg:aspect-auto lg:h-[494px]"
            style={{ backgroundImage: `url(${placeholderImage("shop-kits-hero", 1600, 900)})` }}
          />
        </Reveal>
      </div>
    </section>
  );
}
