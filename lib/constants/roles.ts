export type RoleType =
  | "tutor" | "assessor" | "iqa_tutor"
  | "webinar_moderator" | "webinar_tutor" | "video_presenter";

export const ROLE_TYPES: { value: RoleType; label: string }[] = [
  { value: "tutor", label: "Tutor" },
  { value: "assessor", label: "Assessor" },
  { value: "iqa_tutor", label: "IQA Tutor" },
  { value: "webinar_moderator", label: "Webinar Moderator" },
  { value: "webinar_tutor", label: "Webinar Tutor" },
  { value: "video_presenter", label: "Video Presenter" },
];

export const SUBJECT_AREAS = [
  { value: "health_social_care", label: "Health & Social Care" },
  { value: "early_years", label: "Early Years" },
  { value: "education_training", label: "Education & Training" },
  { value: "business_management", label: "Business Management" },
  { value: "data_science_it", label: "Data Science & IT" },
  { value: "cyber_security", label: "Cyber Security" },
  { value: "other", label: "Other" },
] as const;

export const LEVELS = [
  { value: "level_2", label: "Level 2" },
  { value: "level_3", label: "Level 3" },
  { value: "level_4", label: "Level 4" },
  { value: "level_5", label: "Level 5" },
  { value: "level_6", label: "Level 6" },
  { value: "na", label: "N/A" },
] as const;

export const CONTRACT_STATUSES = [
  { value: "not_sent", label: "Not Sent" },
  { value: "sent", label: "Sent" },
  { value: "signed", label: "Signed" },
  { value: "declined", label: "Declined" },
] as const;

export function roleLabel(v: string) {
  return ROLE_TYPES.find((r) => r.value === v)?.label ?? v;
}
export function subjectLabel(v: string | null) {
  return SUBJECT_AREAS.find((s) => s.value === v)?.label ?? (v ?? "—");
}
export function levelLabel(v: string | null) {
  return LEVELS.find((l) => l.value === v)?.label ?? (v ?? "—");
}
