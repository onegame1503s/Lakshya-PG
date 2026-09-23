import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      email, 
      phone, 
      parent_phone, 
      dob, 
      aadhaar, 
      room, 
      monthly_fee, 
      address, 
      sharing_type 
    } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Full Name and Email Address are required." }, { status: 400 });
    }

    const newStudent = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      parent_phone: parent_phone ? parent_phone.trim() : null,
      dob: dob ? dob.trim() : null,
      aadhaar: aadhaar ? aadhaar.trim() : null,
      room: room ? room.trim() : null,
      monthly_fee: monthly_fee ? Number(monthly_fee) : 8500,
      address: address ? address.trim() : null,
      sharing_type: sharing_type || "Double Sharing",
      status: "approved",
      fee_status: "unpaid",
      rent_due_day: 5,
      admission_date: new Date().toISOString()
    };

    const { error } = await supabase.from("students").insert([newStudent]);
    if (error) {
      console.error("Supabase Manual Insert Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Manual Add API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}