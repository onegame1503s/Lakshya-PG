import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// FETCH all pending applications
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, applications: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// APPROVE a student and set their monthly fee
export async function POST(req: Request) {
  try {
    const { id, monthlyFee } = await req.json();

    if (!monthlyFee) {
      return NextResponse.json({ success: false, error: "Monthly fee is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("students")
      .update({ status: "approved", monthly_fee: monthlyFee })
      .eq("id", id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}