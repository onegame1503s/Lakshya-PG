import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Fetch the student ONLY if they are approved
    const { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("email", email)
      .eq("status", "approved")
      .maybeSingle();

    if (error) throw error;

    if (!student) {
      return NextResponse.json({ success: false, error: "Student profile not found or pending." }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}