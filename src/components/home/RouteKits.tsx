"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { kits } from "@/lib/countries";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import { useSectionVisible } from "@/hooks/useSectionVisible";

const TOPO_IMAGE = "/images/hover-topo2.svg";

// Fixed tile size for the topo background — repeated (not scaled to
// cover) so a single consistent pattern density tiles across the whole
// section instead of one image stretching/growing to fit it, and so it
// reaches every edge (including behind the header and any boxes on top)
// with no gaps, per explicit request.
const TOPO_TILE_SIZE = "1092px"; // 910px + 20% further, per explicit request

export default function RouteKits() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const edgeFadeRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 380, behavior: "smooth" });
  };

  // Tracks whether the carousel is scrolled all the way to one edge, to
  // disable that arrow the same way the reference design shows it (muted
  // when there's nowhere left to go that direction, solid otherwise).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // scroll-pl-8/scroll-pr-8 on the scroller (see below) keep the resting
    // "start" position at a true scrollLeft of 0 — without them the
    // browser's own snap-to-padding-edge behavior settles at scrollLeft ≈
    // 32 instead, which visually erases the 32px margin before the first
    // card. A small threshold is still kept here as a safety margin rather
    // than an exact 0/max check.
    const onScroll = () => {
      setAtStart(el.scrollLeft < 40);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 40);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Mouse click-and-drag scrolling was removed per explicit request — only
  // "slide" navigation remains: the nav buttons (desktop) and native touch
  // swipe (mobile, untouched — it was never part of this effect).

  // Single observer for the whole module — same pattern as Guided trips:
  // every Reveal below is driven off this one flag, so the staggered
  // entrance plays (and resets) together as a group instead of each
  // element triggering independently at its own scroll position. Fires
  // almost the instant the module starts entering the viewport (threshold
  // 0.05), rather than waiting for 40% of it to be in view. See
  // useSectionVisible's own comment for the race-condition fix this now
  // carries (reveal not playing / not resetting between pages, reported
  // live, especially on mobile).
  const moduleVisible = useSectionVisible(sectionRef);

  // Transition to/from its neighbor(s), per explicit request. Since the
  // home module order was swapped (Guided trips now sits directly above
  // this module, Shop below — was the other way around), only the TOP
  // edge needs a fade any more: Guided trips (above) is dark, same hard
  // cut this module used to have against Upcoming trips before the fade
  // was added, so a dark overlay (edgeFadeRef) still starts fully opaque
  // there and fades away as the module settles into view. Shop (below) is
  // light, same as this module's own resting background, so the old
  // bottom-edge fade — which used to dip back to a dark overlay right
  // before Guided trips arrived — is gone; there's no cut to hide any
  // more, and keeping it would have shown a stray dark flash right before
  // a same-colored neighbor.
  // enterRaw is 0 the instant this section's own top edge (i.e. Guided
  // trips' bottom edge, since they're adjacent) touches the bottom of the
  // viewport — the exact moment this module starts becoming visible — and
  // reaches 1 once its top has scrolled up 30% of a viewport height
  // further. visibility (this module's own light content) mirrors it
  // directly; the overlay is simply its inverse.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const FADE = 0.3;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const enterRaw = Math.min(1, Math.max(0, (vh - rect.top) / (vh * FADE)));
      const visibility = enterRaw;
      if (contentRef.current) contentRef.current.style.opacity = String(visibility);
      if (edgeFadeRef.current) edgeFadeRef.current.style.opacity = String(1 - visibility);
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

  // Same cursor-following topo spotlight as Guided trips / the Hero (see
  // Hero.tsx for the full rationale).
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

  return (
    <section
      ref={sectionRef}
      // py-[100px] top/bottom originally, then py-[80px] (-20%), now
      // py-[64px] — another -20% per a further explicit request. This
      // module sits between Guided trips and Shop and touches both gaps
      // being tightened, so both its top and bottom keep shrinking
      // together.
      className="relative flex flex-col justify-center overflow-hidden bg-neutral-100 px-6 py-[64px] md:px-8"
    >
      {/* Topographic-line background — same cursor-following spotlight as
          Guided trips, sitting behind everything else in the section. */}
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

      {/* Dark overlay for the transition from Guided trips above (see the
          effect above) — sits above the topo pattern but below the real
          content. Starts fully opaque (matching Guided trips' dark
          background) at the top edge, fading to fully transparent (this
          section's own light background shows through normally) once the
          module is settled in view. No matching fade at the bottom any
          more — Shop below is the same light color as this module. */}
      <div
        ref={edgeFadeRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-dark"
        style={{ opacity: 1 }}
      />

      <div ref={contentRef} className="relative z-10 w-full">
        {/* Nav buttons moved into this same row as a second flex item, per
            explicit request to align "View more" with them — md:items-end
            bottom-aligns both items, and since "View more" is the last
            line of the left column, its own bottom now lines up with the
            buttons' bottom instead of the two sitting in separate rows.
            md:justify-between keeps the buttons pinned to the row's right
            edge, mirroring the old layout. md:mb-6 (moved here from the
            buttons themselves) keeps the same 24px clearance above the
            cards that the buttons used to carry on their own. */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:mb-6">
          <div className="flex flex-col gap-4">
            {/* Young Serif 52px (font-serif text-h1) — was the small
                mono eyebrow label, per explicit request this is now the
                section's actual visual title. */}
            <RevealLines as="h2" delay={0} show={moduleVisible} className="font-serif text-h1 text-dark">
              Route kits
            </RevealLines>
            {/* Text box narrowed 20% (1008px -> 806px) per explicit
                request. */}
            <RevealLines as="h2" delay={120} show={moduleVisible} className="max-w-[806px] text-body-m">
              Every kit includes the exact GPS track I rode, a short written
              guide to the country, real photos from the road, and honest
              practical tips: season, cost, safety, and how hard it really
              is.
            </RevealLines>
            <Reveal delay={240} show={moduleVisible} className="w-fit">
              <Link href="/shop-kits" className="group flex w-fit items-center gap-4">
                <span className="font-mono text-detail-m uppercase text-dark">
                  View more
                </span>
                <span className="flex shrink-0 items-center justify-center rounded-[6.4px] bg-primary px-[12.8px] py-[12.8px] text-light transition-colors duration-300 group-hover:bg-[#A9B89C] group-active:bg-[#657755]">
                  <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 2l4 4-4 4" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          </div>

          {/* Hidden on mobile, where swipe/drag replaces them (this whole
              block only ever renders at md+). Three states per the
              reference design: muted border/icon when that direction has
              nowhere to go (disabled), solid dark border/icon at rest
              (default), and a soft #1B1F1A-at-10%-opacity fill on hover,
              with the border staying solid dark (no border color change on
              hover). */}
          <Reveal
            delay={1080}
            show={moduleVisible}
            className="hidden justify-end gap-8 md:flex"
          >
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous"
              disabled={atStart}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 ${
                atStart
                  ? "border-dark/40 text-dark/40"
                  : "border-dark text-dark hover:bg-[#1B1F1A]/10"
              }`}
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2L4 6l4 4" />
              </svg>
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next"
              disabled={atEnd}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 ${
                atEnd
                  ? "border-dark/40 text-dark/40"
                  : "border-dark text-dark hover:bg-[#1B1F1A]/10"
              }`}
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 2l4 4-4 4" />
              </svg>
            </button>
          </Reveal>
        </div>

        {/* Bleeds past the section's own p-8 (negative margin) and re-adds
            it as scroll padding instead, so the scrollable box's own edge —
            where overflow content actually gets clipped — lines up with the
            true edge of the screen. With the section's padding INSIDE the
            scroller (the old setup), the clip boundary sat 32px short of
            the screen edge, so the "peek" of the next card had nowhere to
            render and got hard-cut right at the margin. */}
        {/* mt-[18px] on mobile — halved again per explicit request, was
            mt-9 (36px) — unified with the desktop nav-buttons block's own
            top margin above. md:mt-0 still zeroes it out at md+, where the
            nav-buttons block above provides its own spacing. */}
        <div
          ref={scrollerRef}
          className="-mx-6 mt-[18px] flex snap-x gap-6 overflow-x-auto px-6 pb-8 scroll-pl-6 scroll-pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:mt-0 md:px-8 md:scroll-pl-8 md:scroll-pr-8"
        >
          {kits.map((kit, i) => (
            /* Sizing + snap-align live on this static outer div, never
               transformed, so the browser's scroll-snap engine always
               sees a stable box for it — Reveal's own animated
               (scale/translate) div is nested inside instead of being
               the snap target itself. See this file's card-slider
               comment further up for why. */
            <div
              key={kit.slug}
              className="w-[78vw] max-w-[720px] flex-none snap-start"
            >
              <Reveal delay={480 + i * 120} show={moduleVisible}>
              <div className="flex flex-col gap-6 overflow-hidden rounded-2xl bg-light p-4 shadow-sm sm:h-[400px] sm:flex-row">
                {/* Placeholder photo — see src/lib/countries.ts to swap for a real one */}
                <div
                  className="h-56 w-full shrink-0 rounded-xl bg-cover bg-center bg-neutral-300 sm:h-full sm:w-[280px]"
                  style={{ backgroundImage: `url(${kit.image})` }}
                />
                {/* Rebuilt against a supplied reference mockup, per
                    explicit request — the previous version used
                    justify-between to push the title block to the top of
                    the card and the price/description/CTA block down to
                    its bottom (a near-2px gap-0.5 between them meant
                    nothing next to that much bigger, height-driven push),
                    which is why it never actually looked "tight" no matter
                    how many times that 2px value got halved. This is a
                    single top-down flow instead: no justify-between, one
                    real gap (16px) between the title block and the
                    price/description/CTA block below it. */}
                <div className="flex flex-1 flex-col gap-4 sm:py-3">
                  <div className="flex flex-col gap-4">
                    <span className="w-fit rounded-full bg-secondary px-2 py-1 font-mono text-detail-s uppercase text-dark">
                      {kit.days} days
                    </span>
                    {/* Flat 36px at every breakpoint per explicit
                        request — was text-h4 (40px). Same line-height/
                        letter-spacing/weight as the h4 token (1.1 /
                        -0.02em / 500), size dialed down since there's no
                        36px token. min-h-[80px] is the 2-line reservation
                        at 36px/1.1 (was 88px for 40px), so every card
                        still stays the same height regardless of title
                        length. */}
                    <h3 className="line-clamp-2 min-h-[80px] text-[36px] font-medium leading-[1.1] tracking-[-0.02em]">
                      {kit.country}
                    </h3>
                  </div>
                  {/* Price, description and CTA keep a slightly more
                      generous 24px gap between them — a touch more
                      breathing room than the 16px above, matching the
                      reference. */}
                  <div className="flex flex-col gap-6">
                    <p className="text-body-m">{kit.price}€</p>
                    {/* Flat 20px (text-body-s) at every breakpoint per
                        explicit request — was 16px on mobile, up to
                        text-body-s (20px) from lg. */}
                    <p className="text-body-s text-dark">
                      {kit.description}
                    </p>
                    <Link
                      href={`/product-page/${kit.slug}`}
                      className="btn-primary w-fit hover:bg-[#A9B89C] active:bg-[#657755]"
                    >
                      Get the kit
                      <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 2l4 4-4 4" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
