import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Fetch all admins
export async function GET() {
  try {
    const { data, error } = await supabase.from("admins").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add a new admin
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const { data, error } = await supabase.from("admins").insert([{ email }]).select().single();
    if (error) throw error;
    
    return NextResponse.json({ success: true, admin: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Remove an admin
export async function DELETE(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const { error } = await supabase.from("admins").delete().eq("email", email);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}