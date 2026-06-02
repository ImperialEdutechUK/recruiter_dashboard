"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateUserAccess(userId: string, role: string, brandIds: string[]) {
  const supabase = createClient();
  const { error: e1 } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (e1) return { error: e1.message };

  await supabase.from("profile_brands").delete().eq("profile_id", userId);
  if (brandIds.length) {
    const { error: e2 } = await supabase.from("profile_brands")
      .insert(brandIds.map((brand_id) => ({ profile_id: userId, brand_id })));
    if (e2) return { error: e2.message };
  }
  revalidatePath("/settings");
  return {};
}
