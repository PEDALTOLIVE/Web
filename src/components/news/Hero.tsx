"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import { highlightArticle } from "@/lib/news";

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

// Same light bg-neutral-100 + cursor-following "hover-topo2" spotlight as
// shop-kits' Hero/KitsGrid — this page reads as one continuous light page,
// so the header row (title + intro) and the highlight card below both sit
// inside this single section/instance, matching the established per-section
// pattern used everywhere else this effect appears.
export default function Hero() {
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

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-neutral-100 px-6 pb-16 pt-24 text-dark md:px-8 md:pt-28"
    >
      {/* Topographic-line background — same cursor-following spotlight as
          shop-kits, sitting behind everything else in the section. */}
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

      <div className="relative z-10">
        {/* Title left / intro left, offset by a fixed 100px gap — stacked on
            mobile, side by side from tablet up. Was justify-between
            (pushing the paragraph flush right, right-aligned text); per
            explicit correction the paragraph now stays left-aligned and
            sits exactly 100px from the title instead of at the far edge. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-[100px]">
          {/* Fixed 635px box at desktop (was sized purely by its own
              content) — per explicit request, so the title's box stays
              the same width even if the copy itself changes later. */}
          <RevealLines
            as="h1"
            immediate
            delay={0}
            className="font-serif text-h1 lg:w-[635px] lg:text-display-2"
          >
            News
          </RevealLines>
          {/* flex-1 (was capped at max-w-sm) on the Reveal wrapper itself —
              the actual flex item in this row — so the paragraph's box now
              grows from its current position all the way to the section's
              own right margin, per explicit request. */}
          <RevealLines
            as="p"
            immediate
            delay={120}
            className="w-full flex-1 text-left text-body-s text-dark/70"
          >
            Trip reports, new route kits and honest lessons from the road
            — posted whenever there&rsquo;s something worth sharing.
          </RevealLines>
        </div>

        {/* Highlight / lead article — warm cream card, image left (full
            card height), content right. The "Highlight" badge sits in the
            content column now (top-aligned, level with the image's own
            top edge), not layered over the photo — per the attached
            correction. The content column uses justify-between so the
            badge stays pinned to the top and the date/title/description/
            CTA group sits together lower in the card, matching the
            reference's generous gap between the two. Stacks on mobile
            (image on top), sits side by side from tablet up. */}
        <Reveal immediate delay={240} className="mt-16">
          <Link
            href={`/news/${highlightArticle.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-secondary sm:flex-row"
          >
            {/* Fixed aspect ratio at every breakpoint (was sm:h-full
                sm:aspect-auto, which just matched the content column's own
                tight height, leaving barely any gap between the badge and
                the date below it). The image's own height now drives the
                row's height instead, and the content column (a default
                align-items:stretch flex sibling) stretches to match it —
                which is what gives justify-between real space to push the
                badge to the top and the rest of the content down, matching
                the reference's generous gap. p-4/sm:p-6 (was 0 — the image
                sat flush with the card's own edges) gives the image an even
                cream-colored margin on every side, per the attached
                correction; the image keeps its own smaller rounded-xl
                (the outer card is rounded-2xl) now that it's inset. */}
            {/* sm:w-[50.6%] (was 46%) — 10% relatively wider, per explicit
                request. sm:pr-0 (was sm:p-6 on every side, including the
                right side facing the content column) — the image's own
                right-side inset is dropped from sm up so its visible right
                edge sits flush with the content column's boundary; the
                content column's own 32px left padding (px-8, below) is then
                the entire gap between them, matching an explicit 32px
                image-to-text request exactly instead of stacking on top of
                this padding too. Top/left/bottom padding (sm:py-6/sm:pl-6)
                and the mobile p-4 (stacked layout, no adjacent text to
                worry about) are unchanged. */}
            <div className="w-full p-4 sm:w-[50.6%] sm:shrink-0 sm:py-6 sm:pl-6 sm:pr-0">
              {/* lg:aspect-[19/12.96] (was 19/14.4, itself was 19/16),
                  sm:aspect-[3/3.24] (was 3/3.6, was 3/4), aspect-[4/2.43]
                  (was 4/2.7, was 4/3) — a second explicit request to cut a
                  further 10% off the card's height: every breakpoint's
                  height component divided by 0.9 again on top of the first
                  pass (so ~19% shorter than the original in total). A
                  shorter image means a shorter card overall, which is also
                  what pulls the badge-to-date gap in (that gap is leftover
                  space from justify-between below, not a fixed value).

                  overflow-hidden on this fixed-size frame (was missing,
                  which let the group-hover:scale-105 below grow the whole
                  rounded box itself instead of just the photo inside it,
                  unlike every other card on the site) — the scale now
                  lives on the bg-image div nested inside, so it's clipped
                  to this frame's own bounds and only the image content
                  appears to zoom, matching NewsGrid's cards. */}
              <div className="relative aspect-[4/2.43] w-full overflow-hidden rounded-xl sm:aspect-[3/3.24] lg:aspect-[19/12.96]">
                {/* Mobile-only badge, layered over the image's own top-left
                    corner (sm:hidden — the content-column badge below takes
                    over from sm up, unchanged there) — per explicit request,
                    on mobile "Highlight" now reads as an overlay on the
                    photo instead of sitting in the content column below it.
                    Same styling as that badge, just absolutely positioned
                    with a 16px inset matching NewsGrid's own tag treatment;
                    z-10 keeps it above the image's own hover-zoom scale. */}
                <span className="absolute left-4 top-4 z-10 w-fit rounded-full bg-light px-3 py-1 font-mono text-detail-s uppercase text-dark sm:hidden">
                  Highlight
                </span>
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${highlightArticle.image})` }}
                />
              </div>
            </div>
            {/* px-4/sm:px-8 (was a flat px-8 at every breakpoint) — on
                mobile the text column's own 32px side margin was double
                the image's 16px inset (p-4) right above it, per explicit
                request the two should match; sm:px-8 keeps the original
                32px side-margin convention from tablet up, unchanged. */}
            <div className="flex flex-1 flex-col justify-between gap-6 px-4 py-6 sm:px-8 sm:py-10">
              {/* hidden below sm (was always visible here) — on mobile
                  this badge is now the absolute-positioned overlay on the
                  image above instead, per explicit request; unchanged from
                  sm up. */}
              <span className="hidden w-fit rounded-full bg-light px-3 py-1 font-mono text-detail-s uppercase text-dark sm:block">
                Highlight
              </span>
              <div className="flex flex-col gap-4">
                <span className="font-mono text-detail-m uppercase text-dark/50">
                  {highlightArticle.date}
                </span>
                <RevealLines
                  as="h2"
                  immediate
                  delay={0}
                  className="text-[32px] font-medium leading-[1.1] tracking-[-0.02em] text-dark lg:text-h4"
                >
                  {highlightArticle.title}
                </RevealLines>
                {/* max-w-lg removed (was capping this paragraph alone at
                    512px, narrower than the title above it, which has no
                    such cap) — the description now spans the same full
                    content-column width as everything else in this card,
                    per explicit request for a wider content box. */}
                <RevealLines as="p" immediate delay={80} className="text-body-s text-dark/70">
                  {highlightArticle.description}
                </RevealLines>
                {/* Chevron stays put on hover here (was sliding 12px right,
                    same as NewsGrid's cards) — per explicit request, only
                    the button's own background color shifts on this card. */}
                <span className="btn-primary mt-2 w-fit overflow-hidden transition-colors duration-300 group-hover:bg-[#A9B89C] group-active:bg-[#657755]">
                  Full story
                  <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 2l4 4-4 4" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
