import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ROLE_TYPES } from "@/lib/constants/roles";
import type { Candidate } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function RoleTypesPage() {
  await requireRole("manager");
  const supabase = createClient();
  const { data: cands } = await supabase.from("candidates").select("role_type, current_stage, decision");
  const { data: tpls } = await supabase.from("document_templates").select("applies_to");
  const candidates = (cands ?? []) as Pick<Candidate, "role_type" | "current_stage" | "decision">[];

  return (
    <div className="space-y-6">
      <PageHeader title="Role Types" subtitle="The freelance roles tracked in the pipeline, with required-document counts" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLE_TYPES.map((r) => {
          const all = candidates.filter((c) => c.role_type === r.value);
          const active = all.filter((c) => c.decision !== "rejected" && c.current_stage < 10).length;
          const contracted = all.filter((c) => c.current_stage === 10).length;
          const specificDocs = (tpls ?? []).filter((t: any) => t.applies_to === r.value).length;
          const universal = (tpls ?? []).filter((t: any) => !t.applies_to).length;
          return (
            <div key={r.value} className="card-shadow rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{r.label}</h3>
                <Badge variant="muted">{all.length} total</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-2xl font-bold">{active}</p><p className="text-xs text-muted-foreground">Active</p></div>
                <div><p className="text-2xl font-bold">{contracted}</p><p className="text-xs text-muted-foreground">Contracted</p></div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{universal + specificDocs} required documents ({universal} universal + {specificDocs} role-specific)</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
