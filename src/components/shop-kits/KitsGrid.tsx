"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { kits } from "@/lib/countries";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";

const TOPO_IMAGE = "/images/hover-topo2.svg";

// Fixed tile size for the topo background — repeated (not scaled to
// cover) so a single consistent pattern density tiles across the whole
// section instead of one image stretching/growing to fit it, and so it
// reaches every edge (including behind the header and any boxes on top)
// with no gaps, per explicit request.
const TOPO_TILE_SIZE = "1092px"; // 910px + 20% further, per explicit request

// Only 3 buckets (not one chip per exact day-count) — matches the ~3 "Days"
// chips in the attached design, and reads better than 5 near-duplicate
// filters for 5 kits whose day counts are all different.
const DAY_BUCKETS: { label: string; test: (days: number) => boolean }[] = [
  { label: "Up to 14 days", test: (d) => d <= 14 },
  { label: "15–21 days", test: (d) => d >= 15 && d <= 21 },
  { label: "22+ days", test: (d) => d >= 22 },
];

export default function KitsGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const regions = useMemo(() => Array.from(new Set(kits.map((k) => k.region))), []);
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [activeBuckets, setActiveBuckets] = useState<string[]>([]);

  // Same cursor-following "hover-topo2" spotlight as Hero.tsx above — per
  // explicit request, this effect now runs across the whole shop-kits page,
  // with each section (Hero, this one) owning its own scoped instance.
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

  const toggle = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  // Empty selection in a group = no filter applied for that group (every
  // kit passes); a non-empty selection is OR'd within the group, AND'd
  // across the two groups.
  const filteredKits = kits.filter((kit) => {
    const regionOk = activeRegions.length === 0 || activeRegions.includes(kit.region);
    const daysOk =
      activeBuckets.length === 0 ||
      DAY_BUCKETS.some((bucket) => activeBuckets.includes(bucket.label) && bucket.test(kit.days));
    return regionOk && daysOk;
  });

  const chipClass = (active: boolean) =>
    `rounded-full border px-4 py-2 font-mono text-detail-s uppercase transition-colors duration-300 ${
      active ? "border-dark bg-dark text-light" : "border-dark/20 text-dark/70 hover:border-dark/40"
    }`;

  return (
    // No mx-auto/max-w-content — same true-32px-from-edge convention as the
    // rest of the site (see Footer/TripsGrid/HowItWorks); individual text
    // blocks below cap their own width instead. relative + overflow-hidden
    // added to host the hover-topo2 spotlight background below.
    <section
      ref={sectionRef}
      // flex-1 + flex flex-col justify-center — this section now grows to
      // fill whatever space is left over in the page's own min-h-dvh (see
      // page.tsx), instead of sitting at its natural content height with
      // empty background below it before the Footer; justify-center keeps
      // the actual content (filters + card grid) vertically centered in
      // that taller box rather than pinned to its top. Absolutely-
      // positioned children (the topo background layers below) are
      // unaffected by this — they're already out of normal flow.
      className="relative flex flex-1 flex-col justify-center overflow-hidden bg-neutral-100 px-6 pb-8 md:px-8"
    >
      {/* Topographic-line background — same cursor-following spotlight as
          Hero above, sitting behind everything else in this section. */}
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
        {/* Eyebrow removed per explicit request — the h2 below is now the
            section's first element, and the exact 76px gap down from the
            Hero photo above is owned entirely by Hero's own pb-[76px] (no
            mt-* here, which would have added on top of that). */}
        {/* repeat — per explicit request, this module's fade-in replays
            every time it re-enters the viewport (resetting when it scrolls
            out), instead of the site-wide default of firing once. */}
        {/* leading-[1.1] (110% line-height) on mobile only, per explicit
            request — sm:leading-normal reverts to the default at
            tablet/desktop, unaffected. */}
        <RevealLines
          as="h2"
          delay={0}
          repeat
          className="max-w-[1000px] text-[40px] font-medium leading-[1.1] tracking-[-0.02em] text-dark sm:leading-normal lg:text-h2"
        >
          Everything you need to ride it yourself
        </RevealLines>
        <RevealLines as="p" delay={80} repeat className="mt-4 max-w-[1000px] text-body-s text-dark/70">
          Every kit includes the exact GPS track I rode, a short written
          guide to the country, real photos from the road, and honest
          practical tips: season, cost, safety, and how hard it really is.
        </RevealLines>

        <Reveal delay={160} repeat className="mt-10 flex flex-wrap gap-3">
          {regions.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => toggle(region, activeRegions, setActiveRegions)}
              aria-pressed={activeRegions.includes(region)}
              className={chipClass(activeRegions.includes(region))}
            >
              {region}
            </button>
          ))}
          {DAY_BUCKETS.map((bucket) => (
            <button
              key={bucket.label}
              type="button"
              onClick={() => toggle(bucket.label, activeBuckets, setActiveBuckets)}
              aria-pressed={activeBuckets.includes(bucket.label)}
              className={chipClass(activeBuckets.includes(bucket.label))}
            >
              {bucket.label}
            </button>
          ))}
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredKits.map((kit, i) => (
            <Reveal key={kit.slug} delay={240 + i * 80}>
              {/* White card wrapper (rounded-2xl bg-light p-4 shadow-sm), image
                  inset with its own rounded-xl — per the attached design, and
                  the same card treatment RouteKits.tsx already uses for these
                  same kits on the home page (was: image flush with the page's
                  own bg-neutral-100 background, no card at all). */}
              {/* h-full — together with the grid's default stretch
                  alignment, this makes every card in a row match the row's
                  tallest neighbor, instead of each shrinking to its own
                  content height (was: no explicit height, so a card with a
                  one-line title/description sat visibly shorter than one
                  next to it with more text). */}
              <Link
                href={`/product-page/${kit.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-light p-4 shadow-sm"
              >
                <div className="overflow-hidden rounded-xl">
                  {/* Placeholder photo — see src/lib/countries.ts to swap for a real one */}
                  <div
                    className="aspect-[4/3] w-full bg-cover bg-center bg-neutral-300 transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${kit.image})` }}
                  />
                </div>
                {/* flex-1 so this block fills the rest of the h-full card,
                    letting the CTA row below sit flush against the bottom
                    (via mt-auto) regardless of how many lines the title or
                    description take. */}
                <div className="mt-6 flex flex-1 flex-col gap-4">
                  <span className="w-fit rounded-full bg-secondary px-2 py-1 font-mono text-detail-s uppercase text-dark">
                    {kit.days} days
                  </span>
                  {/* min-h-[2.2em] (2 lines at this element's own leading-[1.1])
                      reserves height as if the title always wrapped to 2
                      lines — per explicit request — so a 1-line title (e.g.
                      "Iceland") doesn't leave its card shorter than one with
                      a 2-line title (e.g. "Vietnam and Cambodia"). */}
                  <RevealLines
                    as="h3"
                    immediate
                    className="min-h-[2.2em] text-[32px] font-medium tracking-[-0.02em] leading-[1.1] text-dark lg:text-h4"
                  >
                    {kit.country}
                  </RevealLines>
                  <p className="text-body-m text-dark">{kit.price}€</p>
                  {/* min-h-[2.8em] leading-[1.4] — same 2-line reservation
                      idea as the title above, applied here too: without it,
                      a card whose description happens to wrap to 1 line
                      (e.g. Morocco/Colombia) ends up shorter than a row
                      whose tallest card wraps to 2 (e.g. Vietnam and
                      Cambodia), since each grid row still sizes to its own
                      content — cards matched within a row but not across
                      rows until this was added too. */}
                  <p className="min-h-[2.8em] text-body-xs leading-[1.4] text-dark/70 lg:text-body-s">
                    {kit.description}
                  </p>
                  {/* CTA per the attached design: a plain text label + a
                      separate rounded-square orange icon button, spread
                      across the card's full width — not the single filled
                      btn-primary pill used elsewhere (e.g. HowItWorks' "Get in
                      touch"). Same split pattern as the "View more" CTAs in
                      GuidedTrips.tsx/RouteKits.tsx, just spread with
                      justify-between here to match the card's own width
                      instead of sitting close together as w-fit. No nested
                      <Link> — the whole card is already one, so this is a
                      plain span/div; the button still gets its hover/active
                      color change via the parent's `group` class. mt-auto
                      (was mt-2) pins this row to the bottom of the now-
                      flex-1 content block, so it lines up across every card
                      in a row regardless of description length. */}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="font-mono text-detail-m uppercase text-dark">
                      Get the kit
                    </span>
                    <span className="flex shrink-0 items-center justify-center rounded-[6.4px] bg-primary px-[12.8px] py-[12.8px] text-light transition-colors duration-300 group-hover:bg-[#A9B89C] group-active:bg-[#657755]">
                      <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 2l4 4-4 4" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
          {filteredKits.length === 0 && (
            <p className="col-span-full text-body-s text-dark/50">
              No kits match these filters yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
