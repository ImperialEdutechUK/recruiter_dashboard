// Minimal hand-written types. Regenerate the full version with:
//   npm run db:types   (supabase gen types typescript --local)
export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type UserRole = "manager" | "director" | "academic";
export type RoleType =
  | "tutor" | "assessor" | "iqa_tutor"
  | "webinar_moderator" | "webinar_tutor" | "video_presenter";
export type DocumentStatus = "not_submitted" | "received" | "approved" | "rejected";
export type DecisionOutcome = "approved" | "rejected";
export type ContractStatus = "not_sent" | "sent" | "signed" | "declined";
export type AdvertStatus = "draft" | "posted";

export interface Brand { id: string; slug: string; name: string; color: string; }
export interface Profile { id: string; full_name: string; email: string; role: UserRole; is_active: boolean; created_at: string; }

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  primary_brand_id: string;
  role_type: RoleType;
  subject_area: string | null;
  level: string | null;
  suitable_roles: RoleType[];
  current_stage: number;
  interview_date: string | null;
  interview_notes: string | null;
  rating: number | null;
  teams_recording_url: string | null;
  teams_transcript_url: string | null;
  teams_notes_url: string | null;
  decision: DecisionOutcome | null;
  director_notes: string | null;
  decided_by: string | null;
  decided_at: string | null;
  contract_notes: string | null;
  final_contract_status: ContractStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StageTransition {
  id: string; candidate_id: string; from_stage: number | null; to_stage: number;
  actor_id: string | null; note: string | null; created_at: string;
}
export interface CandidateDocument {
  id: string; candidate_id: string; label: string; status: DocumentStatus;
  notes: string | null; updated_by: string | null; updated_at: string;
}
export interface Note { id: string; candidate_id: string; author_id: string | null; body: string; created_at: string; }
export interface Advert {
  id: string; brand_id: string; role_type: RoleType; title: string; body: string | null;
  indeed_job_id: string | null; status: AdvertStatus; created_by: string | null; created_at: string;
}
export interface InductionTask {
  id: string; candidate_id: string; label: string; is_complete: boolean;
  completed_by: string | null; completed_at: string | null;
}

// Loose Database type so the typed Supabase client compiles. Tables use `any`
// row shapes; cast query results to the interfaces above where you need them.
export type Database = {
  public: {
    Tables: Record<string, { Row: any; Insert: any; Update: any; Relationships: [] }>;
    Views: Record<string, never>;
    Functions: Record<string, { Args: any; Returns: any }>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
