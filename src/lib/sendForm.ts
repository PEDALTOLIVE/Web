// Sends a website form submission to Aleix's inbox via FormSubmit
// (https://formsubmit.co) — a free form-to-email relay, so no backend or
// API keys are needed.
//
// IMPORTANT, one-time activation: the very first submission makes FormSubmit
// send an "Activate form" email to the address below. Until the link in that
// email is clicked, messages are NOT delivered.
export const FORM_INBOX = "pedaltolive.ceo@gmail.com";

export async function sendForm(subject: string, fields: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${FORM_INBOX}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: subject,
        _template: "table",
        _captcha: "false",
        // Lets Aleix just hit "Reply" to answer the sender.
        ...(fields.Email ? { _replyto: fields.Email } : {}),
        ...fields,
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as { success?: string | boolean } | null;
    return data?.success === true || data?.success === "true";
  } catch {
    return false;
  }
}
