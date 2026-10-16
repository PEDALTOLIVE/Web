"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import GetKitModal from "@/components/product-page/GetKitModal";
import type { Kit, KitIncludedIconKey } from "@/lib/countries";

const TOPO_IMAGE = "/images/hover-topo2.svg";

// Fixed tile size for the topo background — repeated (not scaled to
// cover) so a single consistent pattern density tiles across the whole
// section instead of one image stretching/growing to fit it, and so it
// reaches every edge (including behind the header and any boxes on top)
// with no gaps, per explicit request.
const TOPO_TILE_SIZE = "1092px"; // 910px + 20% further, per explicit request

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

// One icon per "What's included in this kit" line — mirrors the pattern
// used for guided trips' own "What's included" list.
const INCLUDED_ICONS: Record<KitIncludedIconKey, React.ReactNode> = {
  route: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  ),
  guide: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5.2c2.6-1 5.4-1 9 .6v14c-3.6-1.6-6.4-1.6-9-.6z" />
      <path d="M21 5.2c-2.6-1-5.4-1-9 .6v14c3.6-1.6 6.4-1.6 9-.6z" />
    </svg>
  ),
  photos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8a1 1 0 0 1 1-1h2l1.2-2h7.6L17 7h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <circle cx="12" cy="13" r="3.3" />
    </svg>
  ),
  logistics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3.5h9l3 3V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z" />
      <path d="M15 3.5V6a1 1 0 0 0 1 1h2.5" />
      <path d="M9 12h6M9 15.5h6M9 8.5h3" />
    </svg>
  ),
};

export default function KitDetail({ kit }: { kit: Kit }) {
  // Cursor-spotlight topo background — same pattern as the rest of the
  // site, scoped to this whole section.
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

  // Static gallery — main photo plus (when present) its own thumbnails, all
  // four independent photos with no click-to-swap interaction.
  const gallery = kit.gallery ?? [];

  const specs = [
    { label: "Distance", value: kit.distance },
    { label: "Terrain", value: kit.terrain },
    { label: "Difficulty", value: kit.difficulty },
  ].filter((spec): spec is { label: string; value: string } => Boolean(spec.value));

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-neutral-100 px-6 pb-24 pt-24 text-dark md:px-8 md:pt-28">
      {/* Topographic-line background — always faintly visible (see the base layer below), with a sharper version revealed
          inside a soft circular spotlight that follows the cursor. */}
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
        <Reveal immediate delay={0}>
          <Link
            href="/shop-kits"
            className="inline-flex items-center gap-2 font-mono text-detail-m uppercase text-dark/60 transition-colors duration-300 hover:text-dark"
          >
            <ChevronLeft />
            Back to kits
          </Link>
        </Reveal>

        <RevealLines as="h1" immediate delay={80} className="mt-8 font-serif text-h1 lg:text-display-2">
          {kit.country}
        </RevealLines>

        {/* Gallery — same grid and sizes as the guided-trip page's own
            hero gallery: one large photo, plus (when present) thumbnails
            beside it, the first spanning the full width of that column and
            the rest sitting side by side beneath it. Four distinct,
            independent photos, no interaction (was click-to-swap). */}
        <Reveal immediate delay={160} className="mt-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr]">
            <div
              className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cover bg-center sm:aspect-auto"
              style={{ backgroundImage: `url(${kit.image})` }}
            />
            {gallery.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {gallery.map((src, i) => (
                  <div
                    key={src}
                    className={`aspect-[4/3] overflow-hidden rounded-xl bg-cover bg-center ${
                      i === 0 ? "col-span-2" : ""
                    }`}
                    style={{ backgroundImage: `url(${src})` }}
                  />
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Content left (wide) + price/CTA sidebar right (narrow) — matches
            the guided-trip detail page: sidebar sticky from lg up, ordinary
            inline card above the content on mobile/tablet. */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-[120px]">
          <Reveal immediate delay={80} className="order-2 flex flex-col gap-14 lg:order-1">
            <div>
              <RevealLines as="h2" immediate className="text-h4">
                About this trip
              </RevealLines>
              <RevealLines as="p" immediate delay={60} className="mt-4 text-body-s text-dark/70">
                {kit.longDescription ?? kit.description}
              </RevealLines>
            </div>

            {kit.included && kit.included.length > 0 && (
              <div>
                <RevealLines as="h2" immediate className="text-h4">
                  What&rsquo;s included in this kit
                </RevealLines>
                <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {kit.included.map((item) => (
                    <li key={item.text} className="flex items-start gap-3 text-body-s text-dark/70">
                      <span className="mt-0.5 h-5 w-5 flex-none text-primary">
                        {INCLUDED_ICONS[item.icon]}
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>

          {/* Price/CTA sidebar — no border/background panel, just per-row
              dividers, matching the guided-trip page. Not sticky here (per
              explicit request), unlike the guided-trip sidebar. */}
          <Reveal immediate delay={160} className="order-1 lg:order-2">
            <div className="flex flex-col gap-6">
              {specs.length > 0 && (
                <div className="flex flex-col">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between gap-4 border-b border-dark/15 py-4 first:pt-0"
                    >
                      <span className="font-mono text-detail-s lowercase text-dark/50">
                        {spec.label}
                      </span>
                      <span className="font-mono text-detail-s lowercase text-dark">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-body-m text-dark">
                Total price: <span className="font-semibold">{kit.price}€</span>
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-primary w-full hover:bg-[#A9B89C] active:bg-[#657755]"
              >
                Get the kit
                <ChevronRight />
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <GetKitModal open={modalOpen} onClose={() => setModalOpen(false)} country={kit.country} />
    </section>
  );
}
