import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Only these 4 are strictly mandatory for the admin
    if (!data.name || !data.email || !data.room || !data.monthlyFee) {
      return NextResponse.json({ success: false, error: "Name, Email, Room, and Fee are mandatory." }, { status: 400 });
    }

    const payload = {
      name: data.name,
      email: data.email,
      room: data.room,
      monthly_fee: data.monthlyFee,
      sharing_type: data.sharingType || "Double Sharing",
      dob: data.dob || null,
      father_name: data.fatherName || null,
      mother_name: data.motherName || null,
      phone: data.phone || null,
      parent_phone: data.parentPhone || null,
      aadhaar: data.aadhaar || null,
      coaching: data.coaching || null,
      address: data.address || null,
      disease: data.disease || null,
      status: "approved" // Skips the queue, goes straight to resident!
    };

    const { error } = await supabase.from("students").insert([payload]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}