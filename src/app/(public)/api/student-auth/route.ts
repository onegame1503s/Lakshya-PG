import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if student exists in the database
    const { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("email", cleanEmail)
      .single();

    if (error || !student) {
      return NextResponse.json({ success: false, error: "No registered student found with this email." }, { status: 404 });
    }

    if (student.status !== "approved") {
      return NextResponse.json({ success: false, error: "Your application is still pending admin approval." }, { status: 403 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    console.error("Student Auth Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}