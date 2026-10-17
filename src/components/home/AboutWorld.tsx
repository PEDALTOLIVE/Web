"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import type { CountryTrip } from "@/lib/countries";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";

// The globe is pure WebGL (three.js / react-three-fiber) — it must never run
// during SSR/RSC rendering, which is what triggers the well-known
// "ReactCurrentOwner" crash when a Canvas ends up in the server render path
// under Next.js App Router. ssr: false forces it to mount client-only.
const Globe = dynamic(() => import("@/components/home/Globe"), { ssr: false });

const LINES = [
  "For nearly 12 years, my job has kept me in the air.",
  "Off duty, I leave the plane behind",
  "and get on two wheels.",
  "Road, gravel, mountain, self-supported, no plan B.",
  "What started as an Instagram page",
  "has grown into Pedaltolive:",
  "Talks, sponsors, and a community",
  "that follows every mile.",
];

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// A gentler cousin of smoothstep (Perlin's "smootherstep"): zero velocity
// *and* zero acceleration at both ends, so the start and end of a fade feel
// soft instead of catching the eye — used for the stage1 → stage2 crossfade,
// which was feeling a bit abrupt with plain smoothstep.
function smootherstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// Same fade-up language as the Hero's <Reveal>: opacity plus a small lift,
// just driven by scroll progress instead of an IntersectionObserver.
function applyFade(el: HTMLElement | null, opacity: number, distance = 22) {
  if (!el) return;
  el.style.opacity = String(opacity);
  el.style.transform = `translateY(${(1 - opacity) * distance}px)`;
}

type Star = {
  left: number;
  top: number;
  size: number;
  opMax: number;
  opMin: number;
  duration: number;
  delay: number;
};

// Deterministic PRNG (mulberry32) instead of Math.random(): this component
// is server-rendered then hydrated, and Math.random() would draw different
// star layouts on the server vs. the client, which React's hydration flags
// as a mismatch (attributes that "don't match" between SSR HTML and the
// client render). Seeding it fixed makes every render — server and client
// alike — produce the exact same "random-looking" layout.
function mulberry32(seed: number) {
  let t = seed;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Full-bleed background starfield for the whole scrollytelling module — a
// plain CSS layer (not the WebGL Stars inside Globe.tsx, which only cover
// the small globe canvas itself) so the sky reads as one continuous
// backdrop behind the text *and* the globe, in every stage, instead of
// stars only existing in the little square around the sphere. Generated
// once (useMemo, empty deps) so positions don't reshuffle on re-render.
function generateStars(count: number): Star[] {
  const rand = mulberry32(1337);
  return Array.from({ length: count }, () => {
    const opMax = 0.25 + rand() * 0.55;
    return {
      left: rand() * 100,
      top: rand() * 100,
      size: 1 + rand() * 1.6,
      opMax,
      opMin: opMax * 0.3,
      duration: 3 + rand() * 5,
      delay: rand() * -8, // negative delay so they're mid-twinkle from first paint
    };
  });
}

// "About" and the world map used to be two separate sections; now they're
// one pinned scrollytelling module: the section is 5 screens tall, but its
// content stays fixed in the viewport (position: sticky) while the text
// (and the globe itself) crossfade through three beats as the user scrolls
// through that height — most of it spent on the middle "reading" beat, so
// the line-by-line reveal keeps pace with someone actually reading it.
// Everything here is driven by scroll position, not by React state, so it
// stays smooth — state is only used for which country card is open, which
// changes rarely.
export default function AboutWorld() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);
  const stage3Ref = useRef<HTMLDivElement>(null);
  const globeSizeRef = useRef<HTMLDivElement>(null);
  // 0 (stage 1/2 rest) -> 1 (stage 3, fully grown), read every frame by
  // Globe's own render loop to dolly its camera — see the size comment
  // inside the scroll `update()` effect below for why this replaced the
  // old CSS-width growth.
  const globeZoomRef = useRef(0);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const interactiveRef = useRef(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const globeDraggingRef = useRef(false);
  const hoveringPointRef = useRef(false);

  // Drives the RevealLines/Reveal line-by-line text reveal for stage 1 and
  // stage 3 — mirrors the interactiveRef/setInteractive pattern just below:
  // a ref for the per-frame check (no re-render on every scroll frame) plus
  // state that only updates — and only then re-renders — the instant the
  // stage actually crosses its trigger point, in either direction, so the
  // line reveal replays every time each stage fades back into view.
  const stage1VisibleRef = useRef(false);
  const stage3VisibleRef = useRef(false);
  const [stage1Visible, setStage1Visible] = useState(false);
  const [stage3Visible, setStage3Visible] = useState(false);

  // Bug fix, found from a screen recording of the site hanging on an
  // older Mac: pauses the Globe's WebGL render loop once this whole
  // section is far from the viewport, instead of letting it render every
  // frame forever regardless of scroll position — see the `active` prop
  // comment on Globe.tsx for the full rationale. Same
  // ref-for-the-per-frame-check / state-for-re-render pattern as
  // stage1VisibleRef above.
  const canvasActiveRef = useRef(true);
  const [canvasActive, setCanvasActive] = useState(true);

  const [active, setActive] = useState<CountryTrip | null>(null);
  // Keeps rendering the last-selected trip's content while the panel below
  // fades out, instead of the content popping out instantly with `active`
  // going straight to null (the panel itself stays mounted at all times so
  // its open/close is a transition, not a mount/unmount).
  const [displayActive, setDisplayActive] = useState<CountryTrip | null>(null);
  const [interactive, setInteractive] = useState(false);
  const stars = useMemo(() => generateStars(190), []);

  useEffect(() => {
    if (active) setDisplayActive(active);
  }, [active]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const pRaw = total > 0 ? -rect.top / total : 0;
      const p = Math.min(1, Math.max(0, pRaw));

      // A generous margin (half a viewport height on each side) so the
      // globe is already rendering again well before it's actually back
      // on screen, rather than popping in a frame late right at the edge.
      // Upper bound tightened from vh * 1.5 to vh: the globe is invisible
      // (scale 0 / opacity 0) until the section is ~0.6vh from the top of
      // the screen anyway, so rendering it while the hero is still on screen
      // was pure wasted GPU work competing with the hero video and topo
      // effect — very noticeable on older Macs. vh still leaves a 0.4vh
      // head start before the entrance animation begins.
      const shouldCanvasBeActive = rect.bottom > -vh * 0.5 && rect.top < vh;
      if (shouldCanvasBeActive !== canvasActiveRef.current) {
        canvasActiveRef.current = shouldCanvasBeActive;
        setCanvasActive(shouldCanvasBeActive);
      }

      // How much of the section has scrolled into view *before* it pins —
      // fades the globe up gently, same as the Hero, instead of the content
      // just snapping into place the instant it sticks.
      const entrance = rect.top > 0 ? Math.min(1, Math.max(0, 1 - rect.top / (vh * 0.6))) : 1;
      // The headline text waits for the globe to be mostly in already, so the
      // two never appear as one simultaneous block — the globe reads first,
      // then the words follow it in.
      const textEntrance = smoothstep(0.45, 1, entrance);

      // Each beat now gets its own clean in/out window with a short silent
      // gap before the next one starts, so one piece of text is always fully
      // gone before the next fades in instead of the two crossfading over
      // each other. The section is 360vh tall (reduced from 500vh per a
      // later explicit request to cut the amount of scrolling the whole
      // home needs) — the reading beat (stage 2) still keeps the same
      // proportional share of that height for the 8 lines. The
      // stage1 → stage2 crossfade specifically uses the gentler
      // smootherstep curve.
      //
      // The stage1 → stage2 handoff (fade-out, silent gap, fade-in) used
      // to start fading stage1 out the INSTANT any scroll happened past
      // the pin point (fade-out window 0 → 0.0625, no dwell at all before
      // it) — per explicit bug report, that left no time to actually read
      // "Aleix Mayor, wanderer by choice" before it was already gone, one
      // scroll tick in. Fixed by giving stage1 a real dwell window first
      // (0 → STAGE1_DWELL: fully visible, untouched by scroll) and only
      // starting the fade-out after that, over its own window
      // (STAGE1_DWELL → STAGE1_FADE_END) — same total shape as before
      // (fade-out, silent gap, fade-in into stage2) just with a genuine
      // pause inserted at the front instead of starting mid-fade at p=0.
      // Widened a third time, per a screen recording from a phone: stage 1
      // ("Who is behind the handlebars") was still barely readable before
      // stage 2's wall of text was already up. On a small screen `vh` is
      // small, so this window's *percentage* of the section's scroll
      // range covers noticeably fewer physical pixels than the same
      // percentage does on a tall desktop viewport — a single fast flick
      // (momentum scroll) comfortably clears the whole thing in one go,
      // no matter how generous the percentage looks on paper. Rather than
      // keep nudging the percentages up indefinitely, this jump is a
      // meaningfully bigger one (was 0.08 / 0.15 / 0.18 / 0.25): same
      // shape (dwell, fade-out, silent gap, fade-in), reallocating more
      // of the section's fixed 360vh to this handoff specifically, at the
      // reading beat's expense — the reading beat was never the one
      // getting complaints.
      const STAGE1_DWELL = 0.12; // stays fully visible until here
      const STAGE1_FADE_END = 0.22; // fully faded out by here
      const STAGE2_FADE_START = 0.27; // silent gap after stage1 fades out
      const STAGE2_FADE_END = 0.36; // stage2 fully faded in by here
      //
      // The stage2 → stage3 handoff (fade-out, silent gap, fade-in)
      // started at p 0.75 → 0.88 (~13% of the section's scroll range),
      // then 0.75 → 0.8125 (~6%). Per a further explicit request to cut
      // the number of scroll actions this takes, it's compressed again to
      // about half of that (0.75 → 0.7875, ~3.75%) — same proportions
      // between the three parts, same start point (0.75), so the reading
      // beat isn't shortened, only the handoff keeps getting quicker. This
      // one is untouched by today's stage1-dwell fix above — only the 1→2
      // handoff was reported as passing too fast to read.
      const stage1 = textEntrance * (1 - smootherstep(STAGE1_DWELL, STAGE1_FADE_END, p));
      const stage2 =
        smootherstep(STAGE2_FADE_START, STAGE2_FADE_END, p) * (1 - smoothstep(0.75, 0.765, p));
      const stage3 = smoothstep(0.7725, 0.7875, p);

      const shouldShowStage1 = stage1 > 0.5;
      if (shouldShowStage1 !== stage1VisibleRef.current) {
        stage1VisibleRef.current = shouldShowStage1;
        setStage1Visible(shouldShowStage1);
      }
      const shouldShowStage3 = stage3 > 0.5;
      if (shouldShowStage3 !== stage3VisibleRef.current) {
        stage3VisibleRef.current = shouldShowStage3;
        setStage3Visible(shouldShowStage3);
      }

      applyFade(stage1Ref.current, stage1, 16);
      applyFade(stage2Ref.current, stage2, 16);
      applyFade(stage3Ref.current, stage3);
      if (globeSizeRef.current) {
        // Opacity and scale both ride this single eased value — kept
        // identical on purpose (see note above this block in the diff)
        // so the globe fades AND grows as one smooth, synchronized motion
        // instead of two curves racing each other.
        //
        // Bug fix (explicit report: the grow read as an abrupt pop-in
        // rather than a smooth 0->100 scale): this whole entrance is
        // driven directly off scroll position, recomputed per scroll
        // event/rAF tick. On a slow, continuous scroll that's plenty of
        // frames to look smooth — but on a single fast flick (a trackpad
        // swipe, or Page Down), `entrance` can jump from ~0 straight to 1
        // between one tick and the next, so the globe had nothing to
        // animate: it just snapped from invisible to full size in that
        // one frame. The CSS transition below (see the style prop on this
        // element) is what actually fixes it — it makes the browser
        // interpolate opacity/transform over 300ms no matter how big a
        // jump the JS value makes in one tick, so even a fast flick now
        // reads as a quick but continuous grow instead of a pop. A slow
        // scroll still tracks the finger/wheel closely since 300ms is
        // short relative to a deliberate scroll gesture.
        const globeEase = smootherstep(0, 1, entrance);
        globeSizeRef.current.style.opacity = String(globeEase);
        globeSizeRef.current.style.transform = `scale(${globeEase}) translateY(${(1 - globeEase) * 22}px)`;
      }
      // The globe's own container no longer changes CSS size at all — it
      // used to grow via a --gscale custom property, but resizing a WebGL
      // canvas is a discrete, non-interpolatable operation (a fresh
      // resolution, a fresh framebuffer each time), so no matter how
      // smoothly that CSS value changed, the rendered globe could only
      // ever snap between whatever sizes the browser's resize-observer
      // happened to report — reading as a sudden jump rather than a
      // gradual grow, and, since the canvas isn't centered inside its own
      // (already-resized) container while it catches up, briefly
      // off-center too. `globeZoomRef` instead drives a camera dolly-zoom
      // inside Globe's own render loop (see Globe.tsx), which re-projects
      // the same fixed-size canvas fresh every frame — a continuous
      // number, nothing to reallocate, so it reads as an actual smooth
      // "inflate" and stays centered throughout.
      // It still rides its own wider window rather than `stage3` directly:
      // `stage3` (used for the text/marker fade-in) now ramps across p
      // 0.7725→0.7875, ~1.5% of the scroll (compressed again along with
      // the rest of the stage2→3 handoff, above) — spreading the grow
      // itself across 0.7425→0.7875 (~3x that distance, same ratio as
      // before) is what makes it read as a steady, progressive grow
      // through the 2→3 transition, shrinking back exactly as smoothly
      // the other way (3→2), since it's just a function of p either
      // direction.
      globeZoomRef.current = smoothstep(0.7425, 0.7875, p);

      // A single spotlight inside the stage-2 reading window: the line
      // currently under the "reading position" is fully lit (100%), every
      // other line stays dimmed at 40% rather than disappearing — all the
      // lines are meant to stay legible throughout, just with one clearly
      // brighter than the rest. No crossfade between those two opacity
      // values — each line switches straight from 40% to 100% (and back),
      // no intermediate values as the spotlight moves from one line to
      // the next.
      // (Briefly changed to fully hide the non-active lines at 0% instead
      // of 40%, on a mistaken diagnosis from a screen-recorded bug report
      // — that recording's real issue was something else entirely — per
      // explicit correction this is back to the original 40%.)
      // Start kept in sync with stage2's fade-in end point above (was
      // 0.19, then 0.095, then 0.1319, now STAGE2_FADE_END/0.17) —
      // otherwise there'd be a dead zone where the text is already fully
      // visible but the reading spotlight hasn't started moving yet.
      const local = smoothstep(STAGE2_FADE_END, 0.75, p);
      const n = lineRefs.current.length;
      let closestIndex = 0;
      let closestDist = Infinity;
      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        const center = (i + 0.5) / n;
        const dist = Math.abs(local - center);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });
      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = i === closestIndex ? "1" : "0.4";
      });

      const shouldInteract = stage3 > 0.7;
      if (shouldInteract !== interactiveRef.current) {
        interactiveRef.current = shouldInteract;
        setInteractive(shouldInteract);
        if (!shouldInteract && tooltipRef.current) tooltipRef.current.style.opacity = "0";
      }
      if (stage3 < 0.4) {
        setActive((prev) => (prev ? null : prev));
      }

      // Mobile only: the fixed scroll header (its floating pill in
      // particular) sits right on top of the globe's own drag/tap area
      // once stage 3 takes over the screen, so it's hidden for the
      // duration of that stage via a body class (see globals.css) —
      // desktop has enough room and stays untouched. Gated on `pRaw <= 1`
      // (was missing) so this only applies while genuinely still inside
      // this pinned module — without it, `stage3` stayed stuck at 1 (from
      // clamped `p`) for the rest of the scroll down the home page,
      // hiding the header through every later module (UpcomingTrips,
      // TripsGrid, KitsGrid, Shop, Sponsors) too.
      const hideHeaderForGlobe = stage3 > 0.5 && pRaw <= 1 && window.innerWidth < 768;
      document.body.classList.toggle("hide-header-globe-stage3", hideHeaderForGlobe);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      document.body.classList.remove("hide-header-globe-stage3");
    };
  }, []);

  // "Drag to discover" as a tooltip that follows the cursor anywhere over
  // this module (not just while hovering the globe itself), once stage 3 is
  // active — hidden while the user is actually dragging the globe or
  // hovering one of its country points.
  useEffect(() => {
    const container = stickyRef.current;
    if (!container) return;

    const hide = () => {
      const tooltip = tooltipRef.current;
      if (tooltip) tooltip.style.opacity = "0";
    };

    const onMove = (e: PointerEvent) => {
      if (!interactiveRef.current || globeDraggingRef.current || hoveringPointRef.current) {
        hide();
        return;
      }
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      tooltip.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
      tooltip.style.opacity = "1";
    };

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", hide);
    return () => {
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", hide);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-dark text-light" style={{ height: "360vh" }}>
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
      >
        {/* Background starfield — behind everything, present through every
            stage since it isn't wired to any stage's fade. */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          {stars.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={
                {
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: s.size,
                  height: s.size,
                  animation: `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                  "--op-max": s.opMax,
                  "--op-min": s.opMin,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div
          className={`transition-transform duration-500 ease-out ${
            active ? "sm:-translate-x-20 md:-translate-x-28 lg:-translate-x-36" : ""
          }`}
        >
          <div
            ref={globeSizeRef}
            // Static per-breakpoint size (no longer scroll-driven): resizing
            // a WebGL canvas is a discrete GPU-framebuffer reallocation, not
            // something that can ever look smooth under a CSS transition.
            // The "growth" between stage 2 and stage 3 is done by dollying
            // the Three.js camera closer instead (see `zoomRef` below and
            // the camera-position logic inside Globe.tsx's useFrame) — a
            // cheap per-frame number update with no reallocation, so it can
            // genuinely animate continuously ("hinchándose") on every
            // scroll frame instead of jumping between a couple of discrete
            // canvas resolutions. No `overflow-hidden` here: the camera
            // distance at full zoom is deliberately kept inside the safe
            // margin where the whole sphere always stays inside the frame
            // on its own, so nothing needs cropping.
            className="relative z-0 w-[374px] will-change-transform sm:w-[390px] md:w-[468px] lg:w-[546px]"
            // Smooths out the entrance (opacity + scale, set imperatively
            // above in `update()`) so a fast scroll still interpolates
            // instead of snapping straight to the target value — see the
            // comment above the globeEase block for why this was needed.
            style={{ transition: "opacity 300ms ease-out, transform 300ms ease-out" }}
          >
            <Globe
              interactive={interactive}
              active={canvasActive}
              onSelect={setActive}
              onDraggingChange={(dragging) => {
                globeDraggingRef.current = dragging;
                if (dragging && tooltipRef.current) tooltipRef.current.style.opacity = "0";
              }}
              onPointHoverChange={(hovering) => {
                hoveringPointRef.current = hovering;
                if (hovering && tooltipRef.current) tooltipRef.current.style.opacity = "0";
              }}
              zoomRef={globeZoomRef}
            />
          </div>
        </div>

        {/* "Drag to discover" cursor tooltip — visible anywhere over this
            module while stage 3 is active, not just while hovering the globe
            itself. Subtle: small padding, 10% white fill, 8px corners. */}
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute left-0 top-0 z-30 hidden whitespace-nowrap rounded-[8px] bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-light backdrop-blur-sm transition-opacity duration-150 sm:block"
          style={{ opacity: 0 }}
        >
          Drag to discover
        </div>

        {/* Mobile has no hover, so the cursor-following tooltip above
            (sm:block, hidden below that) never has a way to appear on
            touch. This is its static mobile equivalent — fixed at the
            position from the attached design (bottom-right of the sticky
            stage) — shown only while the globe is actually interactive
            (stage 3), same condition that drives the desktop tooltip. */}
        <div
          className={`pointer-events-none absolute bottom-[182px] right-6 z-30 whitespace-nowrap rounded-[8px] bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-light backdrop-blur-sm transition-opacity duration-300 sm:hidden ${
            interactive ? "opacity-100" : "opacity-0"
          }`}
        >
          Drag to discover
        </div>

        {/* Stage 1 */}
        <div
          ref={stage1Ref}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <Reveal show={stage1Visible}>
            <p className="eyebrow !text-light">Who is behind the handlebars</p>
          </Reveal>
          <RevealLines
            as="h2"
            show={stage1Visible}
            delay={100}
            className="max-w-2xl font-serif text-h1 leading-none md:text-display-2"
          >
            Aleix Mayor, wanderer by choice
          </RevealLines>
          <RevealLines
            as="p"
            show={stage1Visible}
            delay={200}
            className="max-w-lg text-body-s text-secondary"
          >
            Always chasing the next horizon.
          </RevealLines>
        </div>

        {/* Stage 2 — lines light up one by one as you scroll through this beat.
            Sized so each line fits on a single row instead of wrapping: a
            wide, near-edge-to-edge container plus a font scale that only
            grows once there's actually room for it. */}
        <div
          ref={stage2Ref}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-2 text-center sm:px-6"
          style={{ opacity: 0 }}
        >
          <div className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
            {LINES.map((line, i) => (
              <p
                key={line}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                // font-medium added for the mobile size (text-[18px]) per
                // explicit request — the sm+ sizes already carry medium
                // (500) weight as part of their text-body-* tokens, this
                // was the one arbitrary size without it.
                className="text-[18px] font-medium leading-[23px] text-secondary sm:whitespace-nowrap sm:text-body-s sm:leading-relaxed md:text-body-m md:leading-[1.4] lg:text-body-l xl:text-body-xl"
                style={{ opacity: 0.4 }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Stage 3 */}
        <div
          ref={stage3Ref}
          className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-20 sm:px-10 sm:pt-24"
          style={{ opacity: 0 }}
        >
          <Reveal show={stage3Visible}>
            <p className="eyebrow !text-light">Everywhere I&rsquo;ve ridden</p>
          </Reveal>
          <RevealLines
            as="h2"
            show={stage3Visible}
            delay={100}
            className="mt-3 max-w-md font-serif text-[40px] font-normal tracking-[-0.02em] leading-none lg:text-h1"
          >
            The world, one country at a time.
          </RevealLines>
        </div>

        {/* Detail card, opened by clicking a marker on the globe. `absolute`
            (anchored to the sticky wrapper above, not the viewport) so that
            once the user keeps scrolling past this module's last stage, the
            card scrolls away together with the globe — same as everything
            else in this sticky section — instead of staying pinned to the
            screen and getting cut off against the next section (Upcoming
            trips) underneath it. While the sticky wrapper is actually
            "stuck" (top: 0, full viewport height) this still reads as a
            fixed full-height/full-screen panel, exactly as before.
            - Mobile: a near-fullscreen sheet — the viewport minus a small
              margin on every side (inset-4).
            - Desktop (sm+): a right-hand panel spanning nearly the full
              viewport height (inset-y-6), fixed width, with the globe
              shifted left (see the wrapper above) so it stays visible
              beside it. */}
        {/* Always mounted so open/close is a fade transition rather than an
            instant mount/unmount — content comes from `displayActive`, which
            holds the last selection so it doesn't blank out mid-fade. */}
        <div
          className={`absolute inset-4 z-20 overflow-y-auto overscroll-contain rounded-2xl bg-light text-dark shadow-2xl transition-opacity duration-300 sm:inset-y-6 sm:inset-x-auto sm:right-8 sm:w-[420px] md:w-[460px] lg:w-[500px] ${
            active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {displayActive && (
            <>
              <div className="flex items-start justify-between px-5 pt-5">
                <p className="eyebrow">{displayActive.date || displayActive.name}</p>
                {/* Box back up to 44px (h-11/w-11) with an 8px corner radius
                    (rounded-lg, not rounded-xl's 12px) — and the ✕ is now a
                    real 15x15px SVG instead of a text glyph, since a unicode
                    character has no reliable, exact "size" to hold at 15px
                    the way a viewBox'd icon does. group + the svg's own
                    transition still drives the 180°-left spin on hover. */}
                <button
                  onClick={() => setActive(null)}
                  aria-label="Close"
                  className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-dark text-light"
                >
                  <svg
                    viewBox="0 0 15 15"
                    className="h-[15px] w-[15px] transition-transform duration-300 group-hover:-rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 2l11 11M13 2L2 13" />
                  </svg>
                </button>
              </div>
              <div className="px-5 pt-3">
                <h3 className="font-serif text-h3 leading-tight">{displayActive.title}</h3>
              </div>
              {/* Placeholder photo — replace at public{active.image} once you add real trip photos */}
              <div
                className="mx-5 mt-5 aspect-video rounded-xl bg-cover bg-center bg-neutral-100"
                style={{ backgroundImage: `url(${displayActive.image})` }}
              />
              {/* IBM Plex Mono Regular 14px for both the label and the
                  value, per the attached design — text-detail-s bakes in a
                  500 weight, so the size/weight are set explicitly instead
                  (font-mono text-[14px] font-normal) and applied to the
                  whole grid so every label/value pair inherits it; the
                  value's own font-sans/text-body-xs override is dropped. A
                  divider below (border-t) separates this block from the
                  description text underneath. */}
              <div className="grid grid-cols-3 gap-2 px-5 pt-5 font-mono text-[14px] font-normal">
                <div>
                  <p className="text-dark/50">Distance</p>
                  <p>{displayActive.distance ?? "Coming soon"}</p>
                </div>
                <div>
                  <p className="text-dark/50">Duration</p>
                  <p>{displayActive.duration ?? "Coming soon"}</p>
                </div>
                <div>
                  <p className="text-dark/50">Terrain</p>
                  <p>{displayActive.terrain ?? "Coming soon"}</p>
                </div>
              </div>
              <div className="mx-5 mt-5 border-t border-dark/10" />
              <p className="px-5 pb-5 pt-5 text-body-s leading-relaxed text-dark/70">
                {displayActive.description}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
