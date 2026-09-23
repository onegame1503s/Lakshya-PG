import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET all admin emails
export async function GET() {
  try {
    const { data, error } = await supabase.from("admins").select("*");
    if (error) throw error;
    return NextResponse.json({ success: true, admins: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST to add a new admin email
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });

    const { error } = await supabase.from("admins").insert([{ email: email.trim().toLowerCase() }]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}