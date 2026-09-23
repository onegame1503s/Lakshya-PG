import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendBrevoEmail } from "@/lib/brevo";

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

// UPDATE any resident details (Full Profile Edit + Fee/Room/Status)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { 
      id, 
      name, 
      email, 
      phone, 
      parent_phone, 
      dob, 
      aadhaar, 
      address, 
      room, 
      sharing_type, 
      monthly_fee, 
      fee_status, 
      rent_due_day, 
      paid_till, 
      student_email, 
      student_name 
    } = body;
    
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (parent_phone !== undefined) updates.parent_phone = parent_phone;
    if (dob !== undefined) updates.dob = dob;
    if (aadhaar !== undefined) updates.aadhaar = aadhaar;
    if (address !== undefined) updates.address = address;
    if (room !== undefined) updates.room = room;
    if (sharing_type !== undefined) updates.sharing_type = sharing_type;
    if (monthly_fee !== undefined) updates.monthly_fee = monthly_fee === "" ? null : Number(monthly_fee);
    if (fee_status !== undefined) updates.fee_status = fee_status;
    if (rent_due_day !== undefined) updates.rent_due_day = rent_due_day === "" ? null : Number(rent_due_day);
    if (paid_till !== undefined) updates.paid_till = paid_till;

    const { error } = await supabase.from("students").update(updates).eq("id", id);
    if (error) throw error;

    // 🚀 AUTOMATED EMAIL NOTIFICATIONS (Suppressed if fee status is paid)
    try {
      const targetEmail = email || student_email;
      const targetName = name || student_name || "Resident";

      if (targetEmail && fee_status !== 'paid') {
        if (monthly_fee !== undefined) {
          await sendBrevoEmail({
            toEmail: targetEmail,
            toName: targetName,
            subject: "UPDATE: Your Lakshya PG Monthly Fee",
            htmlContent: `<div style="padding: 20px; font-family: sans-serif;"><h2>Hello ${targetName},</h2><p>Your monthly fee structure has been updated to <strong>₹${monthly_fee}</strong>.</p></div>`
          });
        }
        if (room !== undefined) {
          await sendBrevoEmail({
            toEmail: targetEmail,
            toName: targetName,
            subject: "UPDATE: Room Assignment",
            htmlContent: `<div style="padding: 20px; font-family: sans-serif;"><h2>Hello ${targetName},</h2><p>Your room assignment is now: <strong>${room}</strong></p></div>`
          });
        }
      }
    } catch (emailErr) {
      console.error("Email notification warning:", emailErr);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Residents PATCH Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}