"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import { newsArticles } from "@/lib/news";

const TOPO_IMAGE = "/images/hover-topo2.svg";

// Fixed tile size for the topo background — repeated (not scaled to
// cover) so a single consistent pattern density tiles across the whole
// section instead of one image stretching/growing to fit it, and so it
// reaches every edge (including behind the header and any boxes on top)
// with no gaps, per explicit request.
const TOPO_TILE_SIZE = "1092px"; // 910px + 20% further, per explicit request

// Same cursor-following "hover-topo2" spotlight as Hero.tsx above — each
// section on this page owns its own scoped instance, matching the
// established per-section pattern used on shop-kits (Hero + KitsGrid).
export default function NewsGrid() {
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
    // No mx-auto/max-w-content — same true-32px-from-edge convention as the
    // rest of the site; relative + overflow-hidden hosts the spotlight bg.
    <section ref={sectionRef} className="relative overflow-hidden bg-neutral-100 px-6 pb-24 md:px-8">
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

      <div className="relative z-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {newsArticles.map((article, i) => (
          <Reveal key={article.slug} delay={i * 80}>
            {/* No white card wrapper (unlike KitsGrid's kit cards) — per the
                attached design, these secondary cards sit directly on the
                section's own bg-neutral-100 background. */}
            <Link href={`/news/${article.slug}`} className="group flex flex-col">
              <div className="relative overflow-hidden rounded-2xl">
                {/* z-10 added — the image below gains its own stacking
                    context the moment group-hover:scale-105 applies a
                    transform (any transformed element does, even without a
                    z-index), and without an explicit z-index here this tag
                    (position: absolute, z-index: auto) was losing that
                    stacking order on hover and rendering underneath it,
                    making it appear to disappear. An explicit z-index
                    always paints above z-index: auto content, regardless of
                    DOM order or transforms, fixing that. */}
                <span className="absolute left-4 top-4 z-10 rounded-full bg-dark px-3 py-1 font-mono text-detail-s uppercase text-light">
                  {article.tag}
                </span>
                <div
                  className="aspect-[4/3] w-full bg-cover bg-center bg-neutral-300 transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${article.image})` }}
                />
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <span className="font-mono text-detail-m uppercase text-dark/50">
                  {article.date}
                </span>
                <RevealLines
                  as="h3"
                  immediate
                  className="text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-dark lg:text-body-xl"
                >
                  {article.title}
                </RevealLines>
                <RevealLines
                  as="p"
                  immediate
                  delay={60}
                  className="text-body-xs leading-[1.4] text-dark/70 lg:text-body-s"
                >
                  {article.description}
                </RevealLines>
                {/* Plain-link CTA (no colored box) — per the attached
                    mockup's "FULL STORY >" treatment, distinct from the
                    orange-square-icon CTA used on KitsGrid's kit cards.
                    Icon slides 12px right on card hover, per explicit
                    request. */}
                <span className="mt-2 flex w-fit items-center gap-2 font-mono text-detail-m uppercase text-dark transition-colors duration-300 group-hover:text-dark/60">
                  Full story
                  <svg viewBox="0 0 12 12" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 2l4 4-4 4" />
                  </svg>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
