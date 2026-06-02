import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("brands").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "unknown" }, { status: 500 });
  }
}
