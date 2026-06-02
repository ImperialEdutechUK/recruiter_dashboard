import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { NewAdvertDialog } from "@/components/adverts/new-advert-dialog";
import { AdvertsTable } from "@/components/adverts/adverts-table";
import type { Advert, Brand } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdvertsPage() {
  await requireRole("manager");
  const supabase = createClient();
  const { data: adverts } = await supabase
    .from("adverts")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: brands } = await supabase.from("brands").select("*").order("name");

  const rows = (adverts ?? []) as Advert[];
  const brandList = (brands ?? []) as Brand[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job adverts</h1>
          <p className="text-sm text-muted-foreground">
            Track adverts posted to Indeed. Posting itself is done manually on Indeed. Click any row to edit.
          </p>
        </div>
        <NewAdvertDialog brands={brandList} />
      </div>

      <AdvertsTable adverts={rows} brands={brandList} />
    </div>
  );
}
