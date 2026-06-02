import { requireProfile } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const supabase = createClient();
  const { count } = await supabase
    .from("candidates").select("id", { count: "exact", head: true }).eq("current_stage", 5);

  return (
    <div className="flex min-h-screen flex-col">
      <Header name={profile.full_name} role={profile.role} pendingCount={count ?? 0} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={profile.role} />
        <main className="flex-1 overflow-y-auto p-5 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
