"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Reveal from "@/components/ui/Reveal";
import RevealLines from "@/components/ui/RevealLines";
import { placeholderImage } from "@/lib/placeholder";
import type { Kit } from "@/lib/countries";

const TOPO_IMAGE = "/images/hover-topo2.svg";
// Fixed tile size for the topo background — repeated (not scaled to
// cover) so a single consistent pattern density tiles across the whole
// section instead of one image stretching/growing to fit it, and so it
// reaches every edge (including behind the header and any boxes on top)
// with no gaps, per explicit request.
const TOPO_TILE_SIZE = "1092px"; // 910px + 20% further, per explicit request

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  name: string;
  surname: string;
  email: string;
  confirmEmail: string;
  terms: boolean;
  consent: boolean;
};

type FieldErrors = Partial<Record<"name" | "surname" | "email" | "confirmEmail", string>>;

const initialForm: FormState = {
  name: "",
  surname: "",
  email: "",
  confirmEmail: "",
  terms: false,
  consent: false,
};

export default function Checkout({ kit }: { kit: Kit }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  // Same cursor-following "hover-topo2" spotlight used on every other
  // light-variant page (shop-kits, news, contact, policy, product detail).
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
  // idle → processing (brief, simulated — there's no payment backend wired
  // up yet) → paid.
  const [status, setStatus] = useState<"idle" | "processing" | "paid">("idle");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
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
    if (!form.confirmEmail.trim()) next.confirmEmail = "Required";
    else if (form.confirmEmail !== form.email) next.confirmEmail = "Emails don't match";
    return next;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("processing");
    // Simulated round trip — there's no payment backend wired up yet; swap
    // for a real charge call once one exists. The button's
    // Pay with card → Processing… → Paid sequence stays the same.
    window.setTimeout(() => setStatus("paid"), 900);
  };

  // Same 3 field states as Contact.tsx's form (default/typing/error).
  const fieldClass = (hasError?: string) =>
    `w-full rounded-lg border bg-light px-4 py-3 text-body-s text-dark placeholder:text-dark/40 transition-colors duration-300 focus:bg-neutral-100 focus:outline-none disabled:opacity-60 ${
      hasError ? "border-primary" : "border-dark/20 focus:border-dark/40"
    }`;

  const labelClass = (hasError?: string) =>
    `font-mono text-detail-s uppercase transition-colors duration-300 ${
      hasError ? "text-primary" : "text-dark/70"
    }`;

  const formDisabled = status !== "idle";
  const canSubmit = form.terms && form.consent && status === "idle";

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
            href={`/product-page/${kit.slug}`}
            className="inline-flex items-center gap-2 font-mono text-detail-m uppercase text-dark/60 transition-colors duration-300 hover:text-dark"
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2L4 6l4 4" />
            </svg>
            Back
          </Link>
        </Reveal>

        <div className="mt-8 flex flex-col gap-3">
          <Reveal immediate delay={60}>
            <span className="w-fit rounded-full bg-secondary px-3 py-1 font-mono text-detail-s uppercase text-dark">
              {kit.days} days
            </span>
          </Reveal>
          <RevealLines as="h1" immediate delay={100} className="font-serif text-h1">
            {kit.country}
          </RevealLines>
          <Reveal immediate delay={160}>
            <p className="text-body-m text-dark">Total price: {kit.price}€</p>
          </Reveal>
        </div>

        {/* Form left (wider column), photo right — stacks on mobile/tablet,
            side by side from lg up, same split as Contact.tsx. */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
          <div>
            <RevealLines as="h2" immediate delay={160} className="text-body-m font-medium text-dark">
              Contact Detail
            </RevealLines>

            <Reveal immediate delay={220} className="mt-6">
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="checkout-name" className={labelClass(errors.name)}>
                    Name
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    autoComplete="given-name"
                    value={form.name}
                    disabled={formDisabled}
                    onChange={(e) => update("name", e.target.value)}
                    className={fieldClass(errors.name)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="checkout-surname" className={labelClass(errors.surname)}>
                    Surname
                  </label>
                  <input
                    id="checkout-surname"
                    type="text"
                    autoComplete="family-name"
                    value={form.surname}
                    disabled={formDisabled}
                    onChange={(e) => update("surname", e.target.value)}
                    className={fieldClass(errors.surname)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="checkout-email" className={labelClass(errors.email)}>
                    Email
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    disabled={formDisabled}
                    onChange={(e) => update("email", e.target.value)}
                    className={fieldClass(errors.email)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="checkout-confirm-email" className={labelClass(errors.confirmEmail)}>
                    Confirm Email
                  </label>
                  <input
                    id="checkout-confirm-email"
                    type="email"
                    value={form.confirmEmail}
                    disabled={formDisabled}
                    onChange={(e) => update("confirmEmail", e.target.value)}
                    className={fieldClass(errors.confirmEmail)}
                  />
                </div>

                <label className="flex items-start gap-3 text-body-xs text-dark/70">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    disabled={formDisabled}
                    onChange={(e) => update("terms", e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                  />
                  <span>
                    I have read and accept the{" "}
                    {/* No dedicated Purchase Terms page exists on the site
                        yet, so this stays plain emphasized text instead of a
                        Link to somewhere unrelated — happy to build that page
                        and wire this up once there's copy for it. */}
                    <span className="font-medium text-dark underline">
                      Purchase Terms and Conditions
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 text-body-xs text-dark/70">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    disabled={formDisabled}
                    onChange={(e) => update("consent", e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                  />
                  <span>
                    I consent to the use of my personal data to process my purchases, in
                    accordance with the{" "}
                    <Link href="/policy" className="font-medium text-dark underline">
                      Privacy Policy
                    </Link>
                    , and declare that I am over 18 years of age, assuming any legal
                    responsibility for the accuracy of this statement.
                  </span>
                </label>

                {/* Visa / Mastercard marks — a plain wordmark and a generic
                    overlapping-circles shape (not the exact trademarked
                    artwork), just enough to read as "cards accepted" per the
                    attached design. */}
                <div className="flex items-center gap-4">
                  <span className="font-serif text-[22px] italic text-[#1A1F71]">VISA</span>
                  <span className="flex items-center" aria-label="Mastercard">
                    <span className="h-6 w-6 rounded-full bg-[#EB001B] opacity-90" />
                    <span className="-ml-2.5 h-6 w-6 rounded-full bg-[#F79E1B] opacity-90" />
                  </span>
                </div>
                <p className="-mt-3 text-body-xs text-dark/70">
                  Secure checkout process (<span className="text-primary">HTTPS/SSL</span>)
                </p>

                {/* Pay with card → Processing… → Paid (with a check icon),
                    mirroring Contact.tsx's Send → Sending → Sent pattern.
                    Natively disabled until both checkboxes are ticked or a
                    submission is in flight/done — dimmed while waiting on
                    consent/processing, full-color once paid. */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`btn-primary w-full justify-center gap-2 transition-opacity duration-300 ${
                    status === "paid" ? "cursor-default" : "disabled:cursor-not-allowed disabled:opacity-50"
                  }`}
                >
                  {status === "paid" ? (
                    <>
                      Paid
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
                  ) : status === "processing" ? (
                    "Processing…"
                  ) : (
                    "Pay with card"
                  )}
                </button>
              </form>
            </Reveal>
          </div>

          <Reveal immediate delay={320}>
            <div
              className="aspect-square w-full rounded-2xl bg-cover bg-center sm:aspect-[3/4] lg:aspect-[4/5]"
              style={{ backgroundImage: `url(${placeholderImage(`checkout-${kit.slug}`, 900, 1100)})` }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
