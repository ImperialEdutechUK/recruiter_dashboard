import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PipelineView } from "@/components/pipeline/pipeline-view";
import type { Candidate, Brand } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  await requireRole("manager"); // pipeline is the manager workspace
  const supabase = createClient();

  const [{ data: candidates }, { data: brands }] = await Promise.all([
    supabase.from("candidates").select("*").order("updated_at", { ascending: false }),
    supabase.from("brands").select("*").order("name"),
  ]);

  return (
    <PipelineView
      candidates={(candidates ?? []) as Candidate[]}
      brands={(brands ?? []) as Brand[]}
      canCreate
    />
  );
}
