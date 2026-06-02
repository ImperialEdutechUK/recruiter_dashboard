import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { roleLabel } from "@/lib/constants/roles";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireRole("manager");
  const supabase = createClient();
  const [{ data: docTpl }, { data: indTpl }] = await Promise.all([
    supabase.from("document_templates").select("*").order("sort_order"),
    supabase.from("induction_templates").select("*").order("sort_order"),
  ]);
  const universal = (docTpl ?? []).filter((t: any) => !t.applies_to);
  const roleDocs = (docTpl ?? []).filter((t: any) => t.applies_to);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Document and induction checklist templates" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="card-shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Document checklist templates</CardTitle>
            <CardDescription>Applied automatically at Stage 7. Edit in the database (document_templates) to customise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Universal</p>
              <ul className="space-y-1 text-sm text-muted-foreground">{universal.map((t: any) => <li key={t.id}>• {t.label}</li>)}</ul>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role-specific</p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(roleDocs.map((t: any) => t.applies_to))).map((r: any) => (
                  <Badge key={r} variant="muted">{roleLabel(r)} ({roleDocs.filter((t: any) => t.applies_to === r).length})</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Induction templates</CardTitle>
            <CardDescription>Applied automatically at Stage 10 (academic handover).</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">{(indTpl ?? []).map((t: any) => <li key={t.id}>• {t.label}</li>)}</ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
