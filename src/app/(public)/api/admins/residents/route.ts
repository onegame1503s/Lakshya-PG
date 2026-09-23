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

// UPDATE resident fee, status, due date, room, OR paid_till
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, monthly_fee, fee_status, rent_due_day, room, paid_till, student_email, student_name } = body;
    
    const updates: any = {};
    if (monthly_fee !== undefined) updates.monthly_fee = monthly_fee === "" ? null : Number(monthly_fee);
    if (fee_status !== undefined) updates.fee_status = fee_status;
    if (rent_due_day !== undefined) updates.rent_due_day = rent_due_day === "" ? null : Number(rent_due_day);
    if (room !== undefined) updates.room = room;
    if (paid_till !== undefined) updates.paid_till = paid_till;

    const { error } = await supabase.from("students").update(updates).eq("id", id);
    if (error) throw error;

    // 🚀 AUTOMATED EMAIL NOTIFICATIONS (SUPPRESSED IF FEE STATUS IS PAID)
    try {
      if (student_email && fee_status !== 'paid') {
        const residentName = student_name || "Resident";
        
        if (monthly_fee !== undefined) {
          await sendBrevoEmail({
            toEmail: student_email,
            toName: residentName,
            subject: "UPDATE: Your Lakshya PG Monthly Fee",
            htmlContent: `<div style="padding: 20px; font-family: sans-serif;"><h2>Hello ${residentName},</h2><p>Your monthly fee structure has been updated to <strong>₹${monthly_fee}</strong>.</p></div>`
          });
        }
        if (room !== undefined) {
          await sendBrevoEmail({
            toEmail: student_email,
            toName: residentName,
            subject: "UPDATE: Room Assignment",
            htmlContent: `<div style="padding: 20px; font-family: sans-serif;"><h2>Hello ${residentName},</h2><p>Your room assignment is now: <strong>${room}</strong></p></div>`
          });
        }
      }
    } catch (emailErr) {
      console.error("Email notification warning:", emailErr);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}