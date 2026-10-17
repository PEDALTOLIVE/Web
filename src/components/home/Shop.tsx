"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
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

const products = [
  {
    name: "Long sleeves jersey",
    price: "75€",
    image: "/images/clothing-3.png",
    href: "https://www.quetzalspw.com/en/team-store/pedal-to-live/long-sleeves-jersey-pedal-to-live/",
  },
  {
    name: "Short Bibs",
    price: "75€",
    image: "/images/clothing-1.png",
    href: "https://www.quetzalspw.com/en/team-store/pedal-to-live/short-bibs-pedal-to-live/",
  },
  {
    name: "Short sleeve jersey",
    price: "60€",
    image: "/images/clothing-2.png",
    href: "https://www.quetzalspw.com/en/team-store/pedal-to-live/short-sleeve-jersey-pedal-to-live/",
  },
  {
    name: "T-Shirt",
    price: "3,90€",
    image: "/images/clothing-4.png",
    href: "https://www.quetzalspw.com/en/team-store/pedal-to-live/t-shirt-pedal-to-live/",
  },
];

export default function Shop() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Single observer for the whole module: every Reveal below is driven off
  // this one flag (via `show`), so the staggered entrance plays and resets
  // together as a group — same pattern as Guided trips / Route kits. See
  // useSectionVisible's own comment for the race-condition fix this now
  // carries (reveal not playing / not resetting between pages, reported
  // live, especially on mobile).
  const moduleVisible = useSectionVisible(sectionRef);

  // Same cursor-following topo spotlight as Guided trips / Route kits (see
  // GuidedTrips.tsx for the full rationale), just swapped to sit behind
  // this section's own content.
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

  // Mouse-drag scrolling for the mobile/tablet card slider — same as Route
  // kits. Touch already scrolls natively via swipe, and there are no nav
  // buttons here (the grid at md+ doesn't scroll at all, so nothing to
  // disable/enable), so this only has to handle the mouse-pointer case.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Mouse drag-to-scroll. The pointer is only captured once the mouse has
    // actually moved a few px — capturing on pointerdown (as before)
    // retargeted the click to this scroller instead of the product card's
    // <a>, so the Quetzal links stopped opening. A real drag swallows the
    // click that follows it, so dragging never opens a product by accident.
    const DRAG_THRESHOLD = 5;
    let pressed = false;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let pointerId = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pressed = true;
      dragging = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      pointerId = e.pointerId;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pressed) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        dragging = true;
        el.setPointerCapture(pointerId);
      }
      el.scrollLeft = startScroll - dx;
    };
    const stopDrag = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pressed = false;
    };
    const onClickCapture = (e: MouseEvent) => {
      if (dragging) {
        e.preventDefault();
        e.stopPropagation();
        dragging = false;
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", stopDrag);
    el.addEventListener("pointerleave", stopDrag);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", stopDrag);
      el.removeEventListener("pointerleave", stopDrag);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      // py-[100px] top/bottom originally. Top is now 64px — another -20%
      // (was 80px, itself already -20% from 100px) per a further explicit
      // request to keep tightening the gap into Route kits above.
      // Bottom stays 100px, that edge (against Sponsors) still isn't
      // part of this request.
      className="relative flex flex-col justify-center overflow-hidden bg-neutral-100 pt-[64px] pb-[100px]"
    >
      {/* Topographic-line background — always faintly visible (see the base layer below), with a sharper version revealed
          inside a soft circular spotlight that follows the cursor, exactly
          like Guided trips / Route kits. Sits behind everything else in the
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

      {/* Top-edge vignette, per explicit request: the tiled topo pattern
          above (base layer + cursor spotlight) can end in a visibly hard
          cut right at the section's own top boundary — this static
          gradient sits above both topo layers but below the real content
          and dissolves them into the section's own bg-neutral-100 resting
          color near the top, so there's no hard edge to see regardless of
          the spotlight's current position. Same fix as Guided trips' own
          top vignette (see home/GuidedTrips.tsx), just fading to
          neutral-100 instead of dark since this module's resting
          background is light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-neutral-100 to-transparent sm:h-56"
      />

      {/* px-8 here (not container-page) is the same 32px-margin convention
          as Guided trips / Route kits: the section itself only carries the
          vertical 32px (py-8) so the topo spotlight above can stay
          full-bleed (inset-0, unclipped by padding), while this wrapper
          carries the horizontal 32px instead. */}
      <div className="relative z-10 w-full px-6 md:px-8">
        {/* justify-between (which spread the two blocks to the container's
            opposite edges) is gone in favor of a fixed 100px gap, so the
            subtitle/CTA block sits a set distance right of the title instead
            of wherever the row happens to be wide enough to push it — and
            items-start (was items-end) keeps both blocks top-aligned now
            that the CTA moved under the subtitle instead of floating on its
            own at the row's far end. On mobile, where the two blocks stack
            (flex-col), the gap was 24px (gap-6); per explicit request it's
            cut ~70% to 7px so the subtitle sits right under the title —
            desktop's 100px horizontal gap is untouched. */}
        <div className="flex flex-col gap-[7px] md:flex-row md:items-start md:gap-[100px]">
          <div>
            <Reveal delay={0} show={moduleVisible}>
              <p className="eyebrow text-dark">Shop</p>
            </Reveal>
            <RevealLines
              as="h2"
              delay={80}
              show={moduleVisible}
              className="mt-3 max-w-md text-[40px] font-medium tracking-[-0.02em] leading-tight lg:text-h2"
            >
              Clothing for long days on the road
            </RevealLines>
          </div>
          {/* CTA now stacks directly under the subtitle, both left-aligned
              (items-end used to push this whole block, and its children, to
              the right). The invisible "Shop" line below is a spacer, not a
              duplicate label: it's the exact same markup as the real eyebrow
              (same font/line-height), just invisible, so it reserves the
              identical vertical space before the subtitle — landing the
              subtitle's own top edge exactly level with the h2's top edge
              next to it, instead of level with "Shop" itself. mt-3 mirrors
              the h2's own mt-3, and the CTA's mt-4 keeps the same 16px
              rhythm the old gap-4 gave it. */}
          <Reveal delay={120} show={moduleVisible} className="flex flex-col items-start">
            <p className="eyebrow invisible" aria-hidden="true">
              Shop
            </p>
            {/* whitespace-nowrap (and no max-w constraint fighting it) keeps
                this on one line. */}
            <RevealLines as="p" immediate delay={0} className="mt-3 whitespace-nowrap text-body-s text-dark">
              Gear I actually wear, mile after mile.
            </RevealLines>
            {/* Clothing is sold through Quetzal — linking out rather than a
                built-in checkout, per the current scope. */}
            <a
              href="https://www.quetzalspw.com/en/team-store/pedal-to-live/"
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-4 w-fit hover:bg-[#A9B89C] active:bg-[#657755]"
            >
              See all
              <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 2l4 4-4 4" />
              </svg>
            </a>
          </Reveal>
        </div>

        {/* Mobile/tablet: same horizontal-slider bleed technique as Route
            kits (-mx-8/px-8 moves the scroll-clipping boundary out to the
            true screen edge, snap-x + drag-to-scroll for navigation, no nav
            buttons — native touch swipe covers mobile). Desktop (md+): all
            4 products fit comfortably, so it reverts to a plain static
            grid instead of staying a scroller. */}
        <div
          ref={scrollerRef}
          className="relative mt-28 -mx-6 flex cursor-grab snap-x gap-8 overflow-x-auto px-6 pb-8 scroll-pl-6 scroll-pr-6 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:cursor-default md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0"
        >
          {products.map((p, i) => (
            /* Sizing + snap-align live on this static outer div, never
               transformed, so the browser's scroll-snap engine always
               sees a stable box for it — Reveal's own animated
               (scale/translate) div is nested inside instead of being
               the snap target itself. Same fix as the RouteKits card
               slider above it. */
            <div
              key={p.name}
              className="w-[62vw] max-w-[260px] flex-none snap-start md:w-auto md:max-w-none"
            >
              <Reveal delay={240 + i * 120} show={moduleVisible}>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col rounded-2xl bg-light p-6 shadow-sm"
              >
                <div className="aspect-[296/240] overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="mt-6 text-body-s text-dark">{p.name}</p>
                <p className="mt-1 text-body-xs text-dark/50">{p.price}</p>
              </a>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
