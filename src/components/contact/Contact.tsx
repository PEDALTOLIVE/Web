"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import { placeholderImage } from "@/lib/placeholder";
import { useSectionVisible } from "@/hooks/useSectionVisible";
import { sendForm } from "@/lib/sendForm";

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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Instagram teaser cards, in the order they should appear. Each CARDn.png
// already has its own play icon, title and view-count baked into the
// image from the design export, so these are plain linked photos, not
// rebuilt UI — see the "Instagram" section near the bottom of the page.
const INSTAGRAM_REELS = [
  { image: "/images/CARD1.png", href: "https://www.instagram.com/pedaltolive/reel/DcL_JSeNZve/" },
  { image: "/images/CARD2.png", href: "https://www.instagram.com/pedaltolive/reel/DYRgXNSpoFt/" },
  { image: "/images/CARD3.png", href: "https://www.instagram.com/pedaltolive/reel/DRbXMhbCZhB/" },
  { image: "/images/CARD4.png", href: "https://www.instagram.com/pedaltolive/reel/DVZFJZzDdxk/" },
  { image: "/images/CARD5.png", href: "https://www.instagram.com/reel/DYor0eXpFQ1/" },
];

function ChevronRight() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2l4 4-4 4" />
    </svg>
  );
}

type FormState = {
  name: string;
  surname: string;
  email: string;
  comment: string;
  consent: boolean;
};

type FieldErrors = Partial<Record<"name" | "surname" | "email", string>>;

const initialForm: FormState = {
  name: "",
  surname: "",
  email: "",
  comment: "",
  consent: false,
};

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  // Fix, per explicit report: the Instagram cards below were each using
  // their own self-triggering `repeat` Reveal. On both mobile (all cards
  // sit in a single horizontally-scrolling row, so a vertical scroll into
  // view crosses every card's own threshold within the same instant) and
  // desktop (the lg: grid puts all 5 in one row too), every card's own
  // observer fires at essentially the same moment — CSS transition-delay
  // alone was meant to stagger them from there, but per the repeated
  // report that still isn't reading as "one by one". Switching to the
  // exact shared-observer + `show` pattern the other pages' card grids
  // already use (RouteKits.tsx, Shop.tsx, GuidedTrips.tsx) instead of a
  // per-card observer removes any doubt: one flag drives every card's
  // `show`, and only the per-card `delay` staggers the reveal.
  const instagramRef = useRef<HTMLDivElement>(null);
  const instagramVisible = useSectionVisible(instagramRef);

  // Same cursor-following "hover-topo2" spotlight used on every other
  // light-variant page (shop-kits, news) — kept for consistency even
  // though the form/photo layout sits on top of it.
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

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  // idle → sending (brief, simulated — there's no backend yet) → sent.
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [submitError, setSubmitError] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear that one field's error the moment the user edits it, instead of
    // making them re-submit to see it clear.
    if (key in errors) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.surname.trim()) next.surname = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!EMAIL_PATTERN.test(form.email)) next.email = "Enter a valid email";
    return next;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("sending");
    setSubmitError(false);
    // Real delivery to Aleix's inbox (see lib/sendForm.ts).
    sendForm("New message from pedaltolive.com", {
      Name: `${form.name} ${form.surname}`.trim(),
      Email: form.email,
      Message: form.comment || "(no message)",
    }).then((ok) => {
      if (ok) setStatus("sent");
      else {
        setStatus("idle");
        setSubmitError(true);
      }
    });
  };

  // Shared input/textarea styling: light default, a slightly filled
  // background while focused ("typing"), and a primary-colored border once
  // that field has failed validation — matching the three demonstrated
  // states in the attached design (filled/normal, typing, error).
  const fieldClass = (hasError?: string) =>
    `w-full rounded-lg border bg-light px-4 py-3 text-body-s text-dark placeholder:text-dark/40 transition-colors duration-300 focus:bg-neutral-100 focus:outline-none disabled:opacity-60 ${
      hasError ? "border-primary" : "border-dark/20 focus:border-dark/40"
    }`;

  const labelClass = (hasError?: string) =>
    `font-mono text-detail-s uppercase transition-colors duration-300 ${
      hasError ? "text-primary" : "text-dark/70"
    }`;

  const formDisabled = status !== "idle";
  const canSubmit = form.consent && status === "idle";

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
        {/* Intro stacked directly below the title at every breakpoint (was
            side by side with the title from tablet up, matching News' own
            header row) — per explicit correction, this page instead always
            stacks, with an exact 24px gap between the two. */}
        <div className="flex flex-col gap-6">
          <RevealLines as="h1" immediate delay={0} className="w-full font-serif text-h1 lg:text-display-2">
            Get in touch
          </RevealLines>
          {/* w-full (was max-w-sm, capping this at 384px) — the subtitle now
              spans the full page width like the title above it, per
              explicit request, instead of stopping short partway across. */}
          <RevealLines as="p" immediate delay={120} className="w-full text-left text-body-s text-dark/70">
            Questions about a route kit, a guided trip, or a sponsorship
            idea? Send a message and I&rsquo;ll get back to you myself.
          </RevealLines>
        </div>

        {/* Form left (wider column), photo right — stacks on mobile/tablet,
            side by side from lg up, per the attached design. lg:items-start
            removed (was forcing the photo to its own fixed aspect ratio,
            independent of the form's height) so the grid instead defaults
            to align-items: stretch at lg — both columns become exactly the
            taller sibling's height, and the photo below fills that height
            instead of following its own ratio. */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">
          <Reveal immediate delay={240}>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-name" className={labelClass(errors.name)}>
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="given-name"
                    value={form.name}
                    disabled={formDisabled}
                    onChange={(e) => update("name", e.target.value)}
                    className={fieldClass(errors.name)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-surname" className={labelClass(errors.surname)}>
                    Surname
                  </label>
                  <input
                    id="contact-surname"
                    type="text"
                    autoComplete="family-name"
                    value={form.surname}
                    disabled={formDisabled}
                    onChange={(e) => update("surname", e.target.value)}
                    className={fieldClass(errors.surname)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-email" className={labelClass(errors.email)}>
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  disabled={formDisabled}
                  onChange={(e) => update("email", e.target.value)}
                  className={fieldClass(errors.email)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-comment" className={labelClass()}>
                  Comment
                </label>
                <textarea
                  id="contact-comment"
                  rows={5}
                  value={form.comment}
                  disabled={formDisabled}
                  onChange={(e) => update("comment", e.target.value)}
                  className={`${fieldClass()} resize-none`}
                />
              </div>

              <label className="flex items-start gap-3 text-body-xs text-dark/70">
                <input
                  type="checkbox"
                  checked={form.consent}
                  disabled={formDisabled}
                  onChange={(e) => update("consent", e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                  I have read and accept the{" "}
                  <Link href="/policy" className="font-medium text-dark underline">
                    Privacy Policy
                  </Link>{" "}
                  and consent to the processing of my data to manage my
                  enquiry.
                </span>
              </label>

              {/* Send → Sending… → Sent (with a check icon), per explicit
                  request. Natively disabled once consent isn't checked or a
                  submission is in flight/done, so it can't be re-clicked or
                  double-submitted — dimmed while waiting on consent/sending,
                  but full-color once sent (a "disabled" success state
                  should still read as a success, not a greyed-out one). */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`btn-primary w-full justify-center gap-2 transition-opacity duration-300 ${
                  status === "sent" ? "cursor-default" : "disabled:cursor-not-allowed disabled:opacity-50"
                }`}
              >
                {status === "sent" ? (
                  <>
                    Sent
                    <svg
                      viewBox="0 0 16 16"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8.5l3.5 3.5L13 5" />
                    </svg>
                  </>
                ) : status === "sending" ? (
                  "Sending…"
                ) : (
                  "Send"
                )}
              </button>
              {status === "sent" && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-lg border border-[#657755]/30 bg-[#A9B89C]/20 px-4 py-3 text-body-xs text-dark"
                >
                  <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-[#657755]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 8.5l3.5 3.5L13 5" />
                  </svg>
                  <p>
                    <span className="font-semibold">Message sent successfully!</span> Thanks for getting in
                    touch — I&rsquo;ll get back to you as soon as possible.
                  </p>
                </div>
              )}
              {submitError && (
                <p role="alert" className="text-body-xs text-primary">
                  Sorry, your message couldn&rsquo;t be sent. Please try again, or email{" "}
                  <a href="mailto:pedaltolive.ceo@gmail.com" className="underline">pedaltolive.ceo@gmail.com</a>.
                </p>
              )}
            </form>
          </Reveal>

          {/* aspect-* kept at mobile/tablet (a single stacked column has no
              sibling height to match there), dropped at lg in favor of
              h-full — with the grid above now stretching both columns to
              equal height, this fills exactly the form's own rendered
              height instead of following a fixed ratio that could run
              shorter or taller than it, per explicit request. */}
          <Reveal immediate delay={360} className="lg:h-full">
            <div
              className="aspect-square w-full rounded-2xl bg-cover bg-center sm:aspect-[3/4] lg:aspect-auto lg:h-full"
              style={{ backgroundImage: `url(${placeholderImage("contact-hero", 900, 1100)})` }}
            />
          </Reveal>
        </div>

        {/* Instagram teaser — eyebrow + heading + Follow me CTA (wraps
            below the heading on narrow screens instead of staying side by
            side, matching the attached design), then a horizontally
            scrolling strip of reel cards. */}
        <div className="mt-24">
          <Reveal delay={0} repeat>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-detail-s uppercase text-dark/50">Instagram @pedaltolive</p>
                <RevealLines
                  as="h2"
                  delay={0}
                  repeat
                  className="mt-2 text-[40px] font-medium tracking-[-0.02em] leading-tight lg:text-h2"
                >
                  {["Know more about", "my everyday journey"]}
                </RevealLines>
              </div>
              <a
                href="https://www.instagram.com/pedaltolive/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-fit hover:bg-[#A9B89C] active:bg-[#657755]"
              >
                Follow me
                <ChevronRight />
              </a>
            </div>
          </Reveal>

          {/* -mx-8/px-8 lets the strip bleed to the true screen edge (same
              trick as RouteKits' own carousel) on mobile/tablet, so the
              last card can scroll flush with the viewport. From lg up the
              bleed is cancelled and the strip becomes a 5-column grid, so
              the cards (plus the gaps between them) span the section's
              full margin-to-margin width instead of bunching at a small
              fixed gap. */}
          {/* Each card now reveals on its own, staggered by index (was a
              single Reveal wrapping the whole strip, so all 5 cards popped
              in together at once) — per explicit request, matching how the
              card grids on the other pages (Shop, Route kits, Guided
              trips...) reveal one by one instead of as a block. repeat on
              each keeps the same replay-on-scroll-back behavior the strip
              already had. */}
          <div
            ref={instagramRef}
            className="-mx-6 mt-10 flex snap-x gap-4 overflow-x-auto px-6 pb-2 pt-2 scroll-pl-6 scroll-pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:px-8 md:scroll-pl-8 md:scroll-pr-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:px-0 lg:py-0"
          >
            {/* Sizing/flex classes live on the Reveal wrapper itself (not
                the inner <a>) — Reveal renders its own <div>, so it (not
                the <a> nested inside it) is the actual flex/grid item here;
                same convention as the per-card Reveals in Shop.tsx. */}
            {INSTAGRAM_REELS.map((reel, i) => (
              <Reveal
                key={reel.href}
                delay={80 + i * 100}
                show={instagramVisible}
                className="aspect-[293/458] w-[70vw] max-w-[280px] flex-none snap-start sm:w-[240px] lg:w-full lg:max-w-none"
              >
                <a
                  href={reel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Instagram reel"
                  className="block h-full w-full overflow-hidden rounded-2xl bg-cover bg-center transition-transform duration-300 hover:scale-[1.02]"
                  style={{ backgroundImage: `url(${reel.image})` }}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
