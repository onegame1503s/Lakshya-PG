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

// UPDATE resident fee, status, due date, OR room number (ROBUST & TYPE-SAFE)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, monthly_fee, fee_status, rent_due_day, room, student_email, student_name } = body;
    
    const updates: any = {};
    if (monthly_fee !== undefined) updates.monthly_fee = monthly_fee === "" ? null : Number(monthly_fee);
    if (fee_status !== undefined) updates.fee_status = fee_status;
    if (rent_due_day !== undefined) updates.rent_due_day = rent_due_day === "" ? null : Number(rent_due_day);
    if (room !== undefined) updates.room = room;

    const { error } = await supabase.from("students").update(updates).eq("id", id);
    if (error) {
      console.error("Supabase Update Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 🚀 AUTOMATED EMAIL NOTIFICATIONS (Isolated in try/catch so email errors never block DB updates)
    try {
      if (student_email) {
        const residentName = student_name || "Resident";
        
        if (monthly_fee !== undefined) {
          await sendBrevoEmail({
            toEmail: student_email,
            toName: residentName,
            subject: "UPDATE: Your Lakshya PG Monthly Fee",
            htmlContent: `<div style="padding: 20px; font-family: sans-serif;"><h2>Hello ${residentName},</h2><p>The admin has updated your monthly fee structure.</p><p>Your new monthly fee is: <strong style="font-size: 20px; color: #2563eb;">₹${monthly_fee}</strong></p></div>`
          });
        }
        if (room !== undefined) {
          await sendBrevoEmail({
            toEmail: student_email,
            toName: residentName,
            subject: "UPDATE: Room Assignment",
            htmlContent: `<div style="padding: 20px; font-family: sans-serif;"><h2>Hello ${residentName},</h2><p>Your room assignment has been updated.</p><p>You are now assigned to Room: <strong style="font-size: 20px; color: #2563eb;">${room}</strong></p></div>`
          });
        }
        if (rent_due_day !== undefined) {
          await sendBrevoEmail({
            toEmail: student_email,
            toName: residentName,
            subject: "UPDATE: Your Rent Due Date Changed",
            htmlContent: `<div style="padding: 20px; font-family: sans-serif;"><h2>Hello ${residentName},</h2><p>Your rent due date schedule has been updated to the <strong>${rent_due_day}</strong> of every month.</p></div>`
          });
        }
        if (fee_status !== undefined) {
          await sendBrevoEmail({
            toEmail: student_email,
            toName: residentName,
            subject: "UPDATE: Fee Status Changed",
            htmlContent: `<div style="padding: 20px; font-family: sans-serif;"><h2>Hello ${residentName},</h2><p>Your monthly fee status has been updated to: <strong style="font-size: 18px; color: ${fee_status === 'paid' ? '#10b981' : '#ef4444'};">${fee_status.toUpperCase()}</strong></p></div>`
          });
        }
      }
    } catch (emailErr) {
      console.error("Email notification warning (Ignored for DB success):", emailErr);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Residents PATCH Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}