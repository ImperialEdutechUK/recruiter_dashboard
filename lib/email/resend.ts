import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM ?? "Recruitment <onboarding@resend.dev>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Returns silently if no key configured — notifications are best-effort, never block the workflow.
export async function sendNotification(to: string, subject: string, html: string) {
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping:", subject);
    return;
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from, to, subject, html });
  } catch (err) {
    console.error("[email] send failed", err);
  }
}

export const emailTemplates = {
  pendingReview: (name: string, candidateId: string) => ({
    subject: `Candidate ready for review: ${name}`,
    html: `<p>${name} has reached <strong>Pending Director Review</strong>.</p>
           <p><a href="${appUrl}/candidates/${candidateId}">Open the candidate record</a> to view the interview recording, transcript and notes, then submit your decision.</p>`,
  }),
  decisionMade: (name: string, decision: string, candidateId: string) => ({
    subject: `Decision submitted: ${name} — ${decision}`,
    html: `<p>A director has marked <strong>${name}</strong> as <strong>${decision}</strong>.</p>
           <p><a href="${appUrl}/candidates/${candidateId}">Open the candidate record</a>.</p>`,
  }),
};
