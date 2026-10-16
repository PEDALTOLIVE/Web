"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import type { ArticleBlock, NewsArticle } from "@/lib/news";

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

function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2 key={i} className="mt-4 text-body-m font-medium text-dark first:mt-0">
              {block.text}
            </h2>
          );
        }
        // The one `highlight` paragraph per article renders in the primary
        // color, with thin divider lines directly above and below it only —
        // a border-top + border-bottom on this single block gives exactly
        // that, regardless of what sits next to it.
        if (block.highlight) {
          return (
            <p
              key={i}
              className="border-y border-dark/10 py-6 text-body-s text-primary"
            >
              {block.text}
            </p>
          );
        }
        return (
          <p key={i} className="text-body-s text-dark/70">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export default function ArticleDetail({
  article,
  previous,
  next,
}: {
  article: NewsArticle;
  previous?: NewsArticle;
  next?: NewsArticle;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  // Same cursor-following "hover-topo2" spotlight used on every other
  // light-variant page (shop-kits, news, contact, policy, product-page).
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
      className="relative overflow-hidden bg-neutral-100 px-6 pb-24 pt-24 text-dark md:px-8 md:pt-28"
    >
      {/* Topographic-line background — same cursor-following spotlight as
          the other light-variant pages, sitting behind everything else. */}
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
        <Reveal immediate delay={0}>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 font-mono text-detail-m uppercase text-dark/60 transition-colors duration-300 hover:text-dark"
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2L4 6l4 4" />
            </svg>
            Back to news
          </Link>
        </Reveal>

        {/* Title + tags centered within a constrained column (unlike this
            site's other hero titles, which run the full page width) — the
            hero image just below is NOT constrained the same way, it spans
            the section's own full margins, matching the attached design. */}
        <RevealLines
          as="h1"
          immediate
          delay={80}
          className="mx-auto mt-8 max-w-[770px] text-center font-sans text-body-xl font-medium leading-[1.15] tracking-[-0.02em] text-dark lg:text-h4"
        >
          {article.title}
        </RevealLines>
        <Reveal immediate delay={140}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 font-mono text-detail-s uppercase text-dark"
              >
                {tag}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal immediate delay={200}>
          <div
            className="mt-10 aspect-[4/3] w-full rounded-2xl bg-cover bg-center sm:aspect-[16/9] lg:aspect-[21/9]"
            style={{ backgroundImage: `url(${article.image})` }}
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
          <Reveal immediate delay={280}>
            <div className="flex flex-col gap-6 border-t border-dark/10 pt-6 lg:border-t-0 lg:pt-0">
              <div className="flex flex-col gap-3">
                <span className="text-body-xs text-dark/50">Contributor</span>
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center bg-neutral-300"
                    style={{ backgroundImage: `url(${article.contributorAvatar})` }}
                  />
                  <div className="flex flex-col">
                    <span className="text-body-xs font-medium text-dark">{article.contributor}</span>
                    <span className="text-body-xs text-dark/50">{article.date}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-dark/10 pt-6">
                <span className="text-body-xs text-dark/50">Reading time</span>
                <p className="mt-1 text-body-xs font-medium text-dark">{article.readingTime}</p>
              </div>
            </div>
          </Reveal>

          {/* lg:max-w-[680px] (was unconstrained, stretching to the grid
              column's own right edge) — capping the reading column's width
              leaves a wide margin on its right at desktop, which combined
              with the sidebar + gap on its left reads as the body sitting
              centered across the full page width, per explicit request. */}
          <Reveal immediate delay={320} className="lg:max-w-[680px]">
            <ArticleBody blocks={article.body} />
          </Reveal>
        </div>

        {(previous || next) && (
          <Reveal immediate delay={400}>
            <div className="mt-16 flex items-center justify-center gap-4">
              {/* w-40 on both (was sized by their own text content, so
                  "Previous" rendered noticeably wider than "Next") — a
                  shared fixed width matched to the longer label, per
                  explicit request. */}
              {previous && (
                <Link href={`/news/${previous.slug}`} className="btn-outline-primary w-40 gap-2">
                  <ChevronLeft />
                  Previous
                </Link>
              )}
              {next && (
                <Link href={`/news/${next.slug}`} className="btn-primary w-40 gap-2">
                  Next
                  <ChevronRight />
                </Link>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
