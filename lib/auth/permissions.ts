import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "manager" | "director" | "academic";

export interface SessionProfile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  brandIds: string[]; // accessible brand ids ([] for manager == all)
}

/** Load the signed-in user's profile + accessible brands, or redirect to /login. */
export async function requireProfile(): Promise<SessionProfile> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: pb } = await supabase
    .from("profile_brands")
    .select("brand_id")
    .eq("profile_id", user.id);

  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role as Role,
    brandIds: (pb ?? []).map((r) => r.brand_id),
  };
}

/** Require one of the given roles, else send to the pipeline. */
export async function requireRole(...roles: Role[]): Promise<SessionProfile> {
  const profile = await requireProfile();
  if (!roles.includes(profile.role)) redirect("/");
  return profile;
}

export const can = {
  manageCandidates: (r: Role) => r === "manager",
  reviewDecisions: (r: Role) => r === "manager" || r === "director",
  manageInduction: (r: Role) => r === "manager" || r === "academic",
  viewDashboard: (r: Role) => r === "manager",
  manageAdverts: (r: Role) => r === "manager",
  manageSettings: (r: Role) => r === "manager",
};
