import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// FETCH all approved residents
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, residents: data }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE resident fee amount OR fee status
export async function PATCH(req: Request) {
  try {
    const { id, monthly_fee, fee_status } = await req.json();
    
    const updates: any = {};
    if (monthly_fee !== undefined) updates.monthly_fee = monthly_fee;
    if (fee_status !== undefined) updates.fee_status = fee_status;

    const { error } = await supabase
      .from("students")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}