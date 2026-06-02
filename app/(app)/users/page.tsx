import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { UserAccessRow } from "@/components/settings/user-access-row";
import type { Brand, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireRole("manager");
  const supabase = createClient();
  const [{ data: users }, { data: brands }, { data: pb }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name"),
    supabase.from("brands").select("*").order("name"),
    supabase.from("profile_brands").select("profile_id, brand_id"),
  ]);
  const brandsByUser = (pb ?? []).reduce((acc: Record<string, string[]>, r: any) => {
    (acc[r.profile_id] ??= []).push(r.brand_id); return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Roles and brand access. New sign-ups default to Director until promoted." />
      <div className="card-shadow overflow-hidden rounded-2xl border bg-card">
        <div className="divide-y">
          {(users ?? []).map((u: Profile) => (
            <UserAccessRow key={u.id} user={u} brands={(brands ?? []) as Brand[]} initialBrandIds={brandsByUser[u.id] ?? []} />
          ))}
          {(users ?? []).length === 0 && <p className="p-4 text-sm text-muted-foreground">No users yet.</p>}
        </div>
      </div>
    </div>
  );
}
