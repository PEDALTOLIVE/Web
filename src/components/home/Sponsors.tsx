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

// Each sponsor is either plain text (no logo yet) or has a `logo` pointing
// at a real image in public/images/ (same flat folder as the rest of the
// site's images) — RACC + HolaBICI share one combined mark, so they're a
// single entry here rather than two.
const sponsors: { slug: string; name: string; logo?: string }[] = [
  { slug: "raccholabici", name: "RACC · HolaBICI", logo: "/images/raccholabici.png" },
  { slug: "overstims", name: "Overstim.s" },
  { slug: "quetzal", name: "Quetzal" },
];

export default function Sponsors() {
  const sectionRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  // How many times the sponsors list needs to repeat to form one "half" of
  // the marquee track that's on its own at least as wide as the visible
  // strip. Bug this fixes: with a single un-repeated list (5 short cards,
  // ~1164px total) duplicated just once for the loop, that 1164px "half"
  // was narrower than the strip on most desktop screens — so partway
  // through the loop, once the leading copy had scrolled off, there wasn't
  // yet enough of the trailing copy to fill the remaining width, leaving a
  // bare gap of page background exactly like the one reported. Defaults to
  // 4 (safe for most desktop widths pre-measurement) and is corrected right
  // after mount, and on resize, to whatever the current viewport actually
  // needs.
  const [repeatCount, setRepeatCount] = useState(4);

  // Single observer for the whole module — same pattern as Shop / Guided
  // trips / Route kits. See useSectionVisible's own comment for the
  // race-condition fix this now carries (reveal not playing / not
  // resetting between pages, reported live, especially on mobile).
  const moduleVisible = useSectionVisible(sectionRef);

  // Same cursor-following topo spotlight as Shop / Guided trips / Route
  // kits (see GuidedTrips.tsx for the full rationale).
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

  // Measures the true width of one un-repeated sponsors set (the track's
  // first `sponsors.length` children — always exactly one real set,
  // whatever `repeatCount` currently is, so this measurement never feeds
  // back on its own output) against the visible strip's width, and picks
  // the smallest repeat count that makes one "half" of the track at least
  // as wide as the strip — with one extra copy as a safety margin. Re-runs
  // on every resize via ResizeObserver so it stays correct across
  // breakpoints instead of only being right for the viewport open at
  // mount.
  useEffect(() => {
    const track = trackRef.current;
    const mask = maskRef.current;
    if (!track || !mask) return;

    const recompute = () => {
      const children = track.children;
      if (children.length < sponsors.length) return;
      const first = children[0] as HTMLElement;
      const last = children[sponsors.length - 1] as HTMLElement;
      const setWidth = last.getBoundingClientRect().right - first.getBoundingClientRect().left;
      const containerWidth = mask.offsetWidth;
      if (setWidth <= 0 || containerWidth <= 0) return;
      const needed = Math.min(12, Math.max(2, Math.ceil(containerWidth / setWidth) + 1));
      setRepeatCount((prev) => (prev === needed ? prev : needed));
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(mask);
    return () => observer.disconnect();
  }, []);

  // The two loop halves, each `repeatCount` copies of the sponsors list —
  // see the repeatCount comment above for why this isn't just `sponsors`
  // duplicated once.
  const half = Array.from({ length: repeatCount }, () => sponsors).flat();
  const loop = [...half, ...half];

  return (
    <section
      ref={sectionRef}
      // py-[52px]: top/bottom margin of the module, reduced from 120px per
      // explicit request. min-h-screen removed (it was forcing this
      // section to always be at least a full viewport tall regardless of
      // padding, with justify-center then spreading the content out to
      // fill that — so the real visible gap above/below had nothing to do
      // with py-[52px] at all on most screens). Height is now just
      // content + the 52px padding on each side, nothing more.
      className="relative flex flex-col justify-center overflow-hidden bg-neutral-100 py-[52px]"
    >
      {/* Topographic-line background — always faintly visible (see the base layer below), with a sharper version revealed
          inside a soft circular spotlight that follows the cursor, exactly
          like Shop / Guided trips / Route kits. Sits behind everything else
          in the section. */}
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

      {/* px-8 here (not container-page) is the same 32px-margin convention
          as Shop / Guided trips / Route kits: the section itself only
          carries the vertical 32px (py-8) so the topo spotlight above can
          stay full-bleed (inset-0, unclipped by padding), while this
          wrapper carries the horizontal 32px instead. */}
      <div className="relative z-10 w-full px-6 md:px-8">
        <div className="text-left md:text-center">
          <Reveal delay={0} show={moduleVisible}>
            <p className="eyebrow text-dark">Sponsorship</p>
          </Reveal>
          {/* New per the updated design: a real 40px title under the
              eyebrow, not just the eyebrow standing in as the title anymore.
              Centered (and width-capped + mx-auto so the centering actually
              has room to wrap into two lines like the reference) at md+ to
              match the design image — mobile overrides both of these back
              to left-aligned, per the explicit request. */}
          <RevealLines
            as="h2"
            delay={80}
            show={moduleVisible}
            className="mt-3 max-w-xl text-[40px] font-medium tracking-[-0.02em] leading-tight text-dark md:mx-auto"
          >
            Brands that have already trusted me
          </RevealLines>
        </div>

        {/* Auto-sliding logo strip: the track is two identical "halves" back
            to back, each of them `repeatCount` copies of the sponsors list
            (not just the list once — see the repeatCount comment above),
            animating from translateX(0) to translateX(-50%) — since the two
            halves are identical, the moment it finishes sliding past the
            first one it's pixel-for-pixel where it started, so the loop
            reads as continuous with no visible reset/snap AND no gap of
            bare background once the first copy has scrolled past. Paused on
            hover (desktop) so a curious visitor can actually read a name.
            Used to be clipped at the 32px module margin with a
            linear-gradient mask fading each card out before that edge —
            removed per explicit request. Instead of just deleting the mask
            (which would leave a hard mid-card slice sitting well inside the
            page, right at that 32px line, on a strip that's always
            mid-scroll), -mx-6/md:-mx-8 bleeds this element past the
            module's own padding out to the true screen edges, the same
            convention Route kits' mobile card scroller already uses — so
            whatever a card is doing is happening off past the edge of the
            viewport itself, not clipped early against an arbitrary
            interior line. */}
        <div
          ref={maskRef}
          className="relative -mx-6 mt-8 overflow-hidden md:-mx-8"
        >
          {/* animationDuration scales with repeatCount so the strip's visual
              speed (px/s) stays constant regardless of how many copies a
              given screen width needed — otherwise a wider "half" would
              cover the same -50% in the same base duration, i.e. scroll
              visibly faster on wide screens. */}
          <div
            ref={trackRef}
            className="marquee-track flex w-max gap-4 hover:[animation-play-state:paused]"
            style={{ animationDuration: `${39.2 * repeatCount}s` }}
          >
            {/* Same staggered fade-up-on-entrance as the product/kit cards
                in Shop / Route kits — each card gets its own Reveal (sizing
                classes moved onto the Reveal itself so they aren't lost to
                its extra wrapper div). Every copy (not just the first
                sponsors.length) is already at opacity-100 by the time the
                marquee scrolls it into view, same as it needs to be for the
                loop to read as seamless — the delay just repeats per
                original set (i % sponsors.length) instead of accumulating
                across every duplicate, which would otherwise stretch the
                entrance out over many extra seconds on wide screens. */}
            {loop.map((sponsor, i) => (
              <Reveal
                key={`${sponsor.slug}-${i}`}
                delay={240 + (i % sponsors.length) * 80}
                show={moduleVisible}
                className="h-20 w-[220px] flex-none"
              >
                <div className="flex h-full items-center justify-center rounded-xl bg-light px-4 text-center text-xs font-medium text-dark/60 shadow-sm">
                  {sponsor.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="h-full max-h-12 w-auto object-contain"
                    />
                  ) : (
                    // TODO: replace with a real logo at /images/sponsors/<slug>.png once available
                    sponsor.name
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
