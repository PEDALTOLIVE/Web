"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { kits } from "@/lib/countries";
import Reveal from "@/components/ui/Reveal";

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
  const [active, setActive] = useState(false);
  const [moduleVisible, setModuleVisible] = useState(false);
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

  // Mouse-drag scrolling for desktop/pointer users. Touch already scrolls
  // natively via swipe (and the nav buttons are hidden on mobile), so this
  // only engages for mouse pointers and leaves native touch behavior alone.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      el.scrollLeft = startScroll - (e.clientX - startX);
    };
    const stopDrag = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dragging = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", stopDrag);
    el.addEventListener("pointerleave", stopDrag);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", stopDrag);
      el.removeEventListener("pointerleave", stopDrag);
    };
  }, []);

  // Single observer for the whole module — same pattern as Guided trips:
  // every Reveal below is driven off this one flag, so the staggered
  // entrance plays (and resets) together as a group instead of each
  // element triggering independently at its own scroll position.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setModuleVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setModuleVisible(entry.isIntersecting),
      // Fires almost the instant the module starts entering the viewport,
      // rather than waiting for 40% of it to be in view.
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
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
      className="relative overflow-hidden bg-neutral-100 p-8"
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

      <div className="relative z-10 w-full">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <Reveal delay={0} show={moduleVisible}>
              <p className="eyebrow text-dark">Route kits</p>
            </Reveal>
            <Reveal delay={120} show={moduleVisible}>
              {/* Title text box widened 50% (max-w-2xl/672px -> 1008px)
                  per explicit request. */}
              <h2 className="max-w-[1008px] text-[32px] font-medium tracking-[-0.02em] leading-[1.1] lg:text-h4">
                Every kit includes the exact GPS track I rode, a short
                written guide to the country, real photos from the road, and
                honest practical tips: season, cost, safety, and how hard it
                really is.
              </h2>
            </Reveal>
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
        </div>

        {/* Nav buttons now sit above the cards instead of below them —
            hidden on mobile, where swipe/drag replaces them. Three states
            per the reference design: muted border/icon when that direction
            has nowhere to go (disabled), solid dark border/icon at rest
            (default), and a soft #1B1F1A-at-10%-opacity fill on hover,
            with the border staying solid dark (no border color change on
            hover). mb-6 gives 24px of clearance above the cards. */}
        <Reveal
          delay={1080}
          show={moduleVisible}
          className="mt-[81px] mb-6 hidden justify-end gap-8 md:flex"
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

        {/* Bleeds past the section's own p-8 (negative margin) and re-adds
            it as scroll padding instead, so the scrollable box's own edge —
            where overflow content actually gets clipped — lines up with the
            true edge of the screen. With the section's padding INSIDE the
            scroller (the old setup), the clip boundary sat 32px short of
            the screen edge, so the "peek" of the next card had nowhere to
            render and got hard-cut right at the margin. */}
        <div
          ref={scrollerRef}
          className="-mx-8 mt-6 flex cursor-grab snap-x gap-6 overflow-x-auto px-8 pb-8 scroll-pl-8 scroll-pr-8 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-0"
        >
          {kits.map((kit, i) => (
            <Reveal
              key={kit.slug}
              delay={480 + i * 120}
              show={moduleVisible}
              className="w-[78vw] max-w-[720px] flex-none snap-start"
            >
              <div className="flex flex-col gap-6 overflow-hidden rounded-2xl bg-light p-4 shadow-sm sm:h-[400px] sm:flex-row">
                {/* Placeholder photo — see src/lib/countries.ts to swap for a real one */}
                <div
                  className="h-56 w-full shrink-0 rounded-xl bg-cover bg-center bg-neutral-300 sm:h-full sm:w-[280px]"
                  style={{ backgroundImage: `url(${kit.image})` }}
                />
                <div className="flex flex-1 flex-col justify-between gap-4 sm:py-3">
                  <div className="flex flex-col gap-4">
                    <span className="w-fit rounded-full bg-secondary px-2 py-1 font-mono text-detail-s uppercase text-dark">
                      {kit.days} days
                    </span>
                    {/* Fixed 2-line reservation (line-height x2, scaled to
                        each breakpoint's font size) so every card is the
                        same height regardless of title length. */}
                    <h3 className="line-clamp-2 min-h-[71px] text-[32px] font-medium tracking-[-0.02em] leading-[1.1] lg:min-h-[88px] lg:text-h4">
                      {kit.country}
                    </h3>
                  </div>
                  {/* Price, description and CTA now share one even gap
                      instead of the price being tighter to the description
                      than everything else. */}
                  <div className="flex flex-col gap-4">
                    <p className="text-body-m">{kit.price}€</p>
                    <p className="text-body-xs text-dark lg:text-body-s">
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
          ))}
        </div>
      </div>
    </section>
  );
}
