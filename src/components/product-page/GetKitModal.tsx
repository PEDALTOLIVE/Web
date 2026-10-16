"use client";

import { useEffect, useState, type FormEvent } from "react";
import RevealLines from "@/components/ui/RevealLines";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

export default function GetKitModal({
  open,
  onClose,
  country,
}: {
  open: boolean;
  onClose: () => void;
  country: string;
}) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  // Reset to a blank form a beat after the close animation/unmount, so a
  // reopened modal never flashes the previous submission's state.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      setForm(initialForm);
      setErrors({});
      setStatus("idle");
    }, 300);
    return () => window.clearTimeout(t);
  }, [open]);

  // Esc to close, and lock page scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
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
    window.setTimeout(() => setStatus("sent"), 700);
  };

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-light p-8 text-dark shadow-xl sm:p-10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-lg bg-dark text-light transition-colors duration-300 hover:bg-dark/80"
        >
          <CloseIcon />
        </button>

        {status === "sent" ? (
          <div className="flex flex-col items-start gap-6 pt-2">
            <span className="w-fit rounded-full bg-secondary px-3 py-1 font-mono text-detail-s uppercase text-dark">
              {country}
            </span>
            <RevealLines as="h2" immediate className="font-serif text-h3">
              Thank you!
            </RevealLines>
            <RevealLines as="p" immediate delay={60} className="text-body-s text-dark/70">
              We&rsquo;ve received your request. We&rsquo;ll get in touch with you shortly with
              the next steps to get your kit.
            </RevealLines>
            <button type="button" onClick={onClose} className="btn-primary mt-2 w-fit hover:bg-[#A9B89C] active:bg-[#657755]">
              Close
            </button>
          </div>
        ) : (
          <>
            <span className="w-fit rounded-full bg-secondary px-3 py-1 font-mono text-detail-s uppercase text-dark">
              {country}
            </span>
            <RevealLines as="h2" immediate className="mt-6 font-serif text-h3">
              Get the kit
            </RevealLines>
            <RevealLines as="p" immediate delay={60} className="mt-3 text-body-s text-dark/70">
              Leave your details and we&rsquo;ll get back to you with everything you need to get
              this kit.
            </RevealLines>

            <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="kit-modal-name" className={labelClass(errors.name)}>
                    Name{errors.name ? ` — ${errors.name}` : ""}
                  </label>
                  <input
                    id="kit-modal-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    disabled={formDisabled}
                    className={fieldClass(errors.name)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="kit-modal-surname" className={labelClass(errors.surname)}>
                    Surname{errors.surname ? ` — ${errors.surname}` : ""}
                  </label>
                  <input
                    id="kit-modal-surname"
                    type="text"
                    value={form.surname}
                    onChange={(e) => update("surname", e.target.value)}
                    disabled={formDisabled}
                    className={fieldClass(errors.surname)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="kit-modal-email" className={labelClass(errors.email)}>
                  Email{errors.email ? ` — ${errors.email}` : ""}
                </label>
                <input
                  id="kit-modal-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  disabled={formDisabled}
                  className={fieldClass(errors.email)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="kit-modal-comment" className={labelClass()}>
                  Comment
                </label>
                <textarea
                  id="kit-modal-comment"
                  rows={4}
                  value={form.comment}
                  onChange={(e) => update("comment", e.target.value)}
                  disabled={formDisabled}
                  className={fieldClass()}
                />
              </div>

              <label className="flex items-start gap-3 text-body-xs text-dark/70">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                  disabled={formDisabled}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                {/* Same text-body-xs typography as the contact page's own
                    consent line. Wraps normally onto two lines (was
                    forced onto one with overflow-x-auto + whitespace-nowrap,
                    which just made it scroll horizontally and cut text off
                    — per explicit request, reverted to normal wrapping). */}
                <span>
                  I have read and accept the{" "}
                  <a href="/policy" className="font-medium text-dark underline">
                    Privacy Policy
                  </a>{" "}
                  and consent to the processing of my data to manage my enquiry.
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-primary w-full justify-center gap-2 transition-opacity duration-300 hover:bg-[#A9B89C] active:bg-[#657755] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Send"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
