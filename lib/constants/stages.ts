export type StageType = "manual" | "system" | "director" | "academic";

export interface Stage {
  n: number;
  name: string;
  short: string;
  color: string;
  type: StageType;
  blurb: string;
}

// The 10-stage pipeline (§4). `color` drives the stage badges and tracker.
export const STAGES: Stage[] = [
  { n: 1,  name: "Applications Received",          short: "Applications Received", color: "#3b82f6", type: "manual",   blurb: "Candidate added after CV download from Indeed." },
  { n: 2,  name: "Shortlisted",                    short: "Shortlisted",           color: "#6366f1", type: "manual",   blurb: "Reviewed; BCC interview invitation drafted." },
  { n: 3,  name: "Interview Scheduled",            short: "Interview Scheduled",   color: "#0ea5e9", type: "manual",   blurb: "Confirmed interview date recorded." },
  { n: 4,  name: "Interview Conducted",            short: "Interview Conducted",   color: "#14b8a6", type: "manual",   blurb: "Teams recording, transcript & notes links pasted." },
  { n: 5,  name: "Pending Director Review",        short: "Pending Director Review", color: "#f59e0b", type: "system", blurb: "Visible in the director review queue." },
  { n: 6,  name: "Director Decision",              short: "Director Decision",     color: "#f97316", type: "director", blurb: "Approved or rejected with comments." },
  { n: 7,  name: "Document Collection",            short: "Document Collection",   color: "#8b5cf6", type: "manual",   blurb: "Role-specific checklist created and tracked." },
  { n: 8,  name: "Draft Contract",                 short: "Draft Contract",        color: "#a855f7", type: "manual",   blurb: "Draft rates and contract notes recorded." },
  { n: 9,  name: "Final Contract",                 short: "Final Contract",        color: "#7c3aed", type: "manual",   blurb: "Adobe Sign status marked manually." },
  { n: 10, name: "Contracted — Academic Handover", short: "Handover to Academics", color: "#22c55e", type: "academic", blurb: "Induction checklist managed by academic team." },
];

export function stage(n: number) {
  return STAGES.find((s) => s.n === n) ?? STAGES[0];
}

export const DECISION_STAGE = 6;
export const REVIEW_QUEUE_STAGE = 5;
export const HANDOVER_STAGE = 10;
