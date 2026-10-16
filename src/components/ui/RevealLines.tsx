"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";

interface RevealLinesProps {
  /**
   * Plain text, and this component figures out the visual line breaks
   * itself by measuring the rendered text (see below) — the normal case.
   * Pass a string[] instead when the lines are already decided by hand
   * (e.g. a title with a manual `<br />` in the original design) to skip
   * measurement entirely and render exactly those lines.
   */
  children: string | string[];
  /** Which tag to render (carries `className`, e.g. font-serif text-h1). */
  as?: Tag;
  className?: string;
  /** Delay in ms before the FIRST line starts (site-wide stagger convention,
   * same meaning as Reveal's `delay` — pass index * 100 for a list). */
  delay?: number;
  /** Delay in ms between each subsequent line. */
  lineDelay?: number;
  immediate?: boolean;
  threshold?: number;
  rootMargin?: string;
  repeat?: boolean;
  show?: boolean;
}

// Line-by-line "mask wipe" reveal for titles: each visual line of text is
// clipped inside its own overflow-hidden box and slides up from below
// (translateY(115%) -> 0) instead of the whole block fading/drifting up
// together like the generic Reveal. This is the technique behind the
// dynamic word/line-reveal style requested as a reference (loveandmoney.com)
// — done per LINE rather than per word, since Reveal already wraps
// arbitrary non-text content site-wide and a per-word split isn't
// appropriate for every title.
//
// Because "line" is a *visual* concept (it depends on the current viewport
// width, font, etc.), there's no way to know it up front — so on mount this
// renders the text once as individual (plain inline) word-spans, measures
// each word's offsetTop to group them into lines, then swaps to the final
// masked-line markup. That swap happens in useLayoutEffect, synchronously
// before the browser paints, so nothing is visible in between. Re-measures
// on real width changes (ResizeObserver, gated to width only) so a resize
// or rotation re-splits the lines correctly.
export default function RevealLines({
  children,
  as = "div",
  className = "",
  delay = 0,
  lineDelay = 90,
  immediate = false,
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
  repeat = false,
  show,
}: RevealLinesProps) {
  const Tag = as;
  const manualLines = Array.isArray(children) ? children : null;
  const text = Array.isArray(children) ? children.join(" ") : children;
  const rootRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[] | null>(manualLines);
  const [internalVisible, setInternalVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const controlled = show !== undefined;
  const words = text.split(" ").filter(Boolean);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Measure pass: runs whenever `lines` is null (initial mount, or after a
  // width change resets it below).
  useLayoutEffect(() => {
    if (manualLines || lines !== null) return;
    const el = measureRef.current;
    if (!el) return;
    const wordSpans = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-word]"));
    if (wordSpans.length === 0) return;

    const grouped: string[][] = [];
    let lastTop: number | null = null;
    wordSpans.forEach((span) => {
      const top = span.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        grouped.push([]);
        lastTop = top;
      }
      grouped[grouped.length - 1].push(span.textContent || "");
    });
    setLines(grouped.map((w) => w.join(" ")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, text, manualLines]);

  // Re-measure once every web font used by this element has actually
  // loaded. The very first measurement above almost always runs BEFORE a
  // custom font (Young Serif, the site's sans, etc.) has finished loading
  // — it measures against the browser's fallback font instead, which has
  // different word widths, so the line breaks it computes can be flat-out
  // wrong for the real font once it swaps in (a title that should wrap
  // onto 2 balanced lines ends up split 3 ways with single orphan words,
  // for example). document.fonts.ready resolves once every requested font
  // has loaded, so re-measuring then always reflects the real metrics.
  // Not needed for manual lines — those don't depend on measurement at
  // all. (No ResizeObserver equivalent needed for this specific case: it
  // only has to run once, whenever fonts finish loading, not repeatedly.)
  useEffect(() => {
    if (manualLines) return;
    if (typeof document === "undefined" || !document.fonts?.ready) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setLines(null);
    });
    return () => {
      cancelled = true;
    };
  }, [manualLines]);

  // Re-measure on real width changes only (ignore height-only changes,
  // which happen every time this swaps between the measuring markup and
  // the final line markup, to avoid a feedback loop). Not needed at all
  // for manual lines — those are fixed by the caller regardless of width.
  useEffect(() => {
    if (manualLines) return;
    const container = rootRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    let lastWidth = container.getBoundingClientRect().width;
    let first = true;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? lastWidth;
      if (first) {
        first = false;
        lastWidth = width;
        return;
      }
      if (Math.abs(width - lastWidth) < 1) return;
      lastWidth = width;
      setLines(null);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (controlled || reducedMotion || !lines) return;

    if (immediate) {
      // Double rAF, not a single one: on a fast/cached load (the font is
      // already in the browser's cache, common on a mobile device that's
      // already visited the page once) document.fonts.ready can resolve
      // as a same-tick microtask, before the browser has painted anything
      // at all. A single rAF only guarantees "before the NEXT paint" — it
      // doesn't guarantee a hidden (translateY(115%)) frame was ever
      // actually painted first, so the very first frame the user's eye
      // can see can already be the fully-revealed end state, with no
      // motion to perceive (reported live on mobile, on both the Hero
      // title and the Guided trips page's title/intro, both `immediate`).
      // Waiting a full extra frame (raf inside raf) guarantees the
      // hidden state has been painted at least once before flipping
      // `visible`, so the CSS transition always has something real to
      // animate from, regardless of how fast measurement/fonts settle.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setInternalVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    const el = rootRef.current;
    if (!el) return;

    // Same double-rAF guard as the `immediate` branch above, applied to
    // this component's own (non-immediate, non-controlled) observer path
    // too — used standalone in a few places sitewide that aren't driven
    // by useSectionVisible's shared observer.
    let raf1 = 0;
    let raf2 = 0;
    const apply = (next: boolean) => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setInternalVisible(next));
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (repeat) {
          apply(entry.isIntersecting);
        } else if (entry.isIntersecting) {
          apply(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [immediate, threshold, rootMargin, repeat, controlled, reducedMotion, lines]);

  const visible = reducedMotion ? true : controlled ? !!show : internalVisible;

  return (
    <Tag ref={rootRef as never} className={className}>
      {lines === null ? (
        <span ref={measureRef}>
          {words.map((w, i) => (
            <span key={i} data-word>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      ) : (
        lines.map((line, i) => (
          <span key={i} style={{ display: "block", overflow: "hidden" }}>
            <span
              style={{
                display: "block",
                whiteSpace: "nowrap",
                transform: visible ? "translateY(0%)" : "translateY(115%)",
                transition: "transform 750ms cubic-bezier(0.16,1,0.3,1)",
                transitionDelay: visible ? `${delay + i * lineDelay}ms` : "0ms",
              }}
            >
              {line}
            </span>
          </span>
        ))
      )}
    </Tag>
  );
}
