import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabase.from("admins").select("*");
    if (error) throw error;
    return NextResponse.json({ success: true, admins: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });

    const trimmedEmail = email.trim().toLowerCase();

    // Check if admin already exists
    const { data: existing } = await supabase.from("admins").select("email").eq("email", trimmedEmail).single();
    if (existing) {
      return NextResponse.json({ success: false, error: "This email is already an authorized admin." }, { status: 400 });
    }

    const { error } = await supabase.from("admins").insert([{ email: trimmedEmail }]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}