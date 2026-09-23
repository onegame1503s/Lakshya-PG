import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendBrevoEmail } from "@/lib/brevo"; // Import your email sender!

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export async function PATCH(req: Request) {
  try {
    const { id, monthly_fee, fee_status, rent_due_day, student_email, student_name } = await req.json();
    
    const updates: any = {};
    if (monthly_fee !== undefined) updates.monthly_fee = monthly_fee;
    if (fee_status !== undefined) updates.fee_status = fee_status;
    if (rent_due_day !== undefined) updates.rent_due_day = rent_due_day;

    const { error } = await supabase.from("students").update(updates).eq("id", id);
    if (error) throw error;

    // AUTOMATED EMAIL NOTIFICATIONS TO THE STUDENT
    if (student_email) {
      if (monthly_fee !== undefined) {
        await sendBrevoEmail({
          toEmail: student_email,
          toName: student_name,
          subject: "UPDATE: Your Lakshya PG Monthly Fee",
          htmlContent: `<div style="padding: 20px; font-family: sans-serif;"><h2>Hello ${student_name},</h2><p>The admin has updated your monthly fee structure.</p><p>Your new monthly fee is: <strong style="font-size: 20px; color: #2563eb;">₹${monthly_fee}</strong></p><p>Please log into your resident dashboard to view the changes.</p></div>`
        });
      }
      if (rent_due_day !== undefined) {
        await sendBrevoEmail({
          toEmail: student_email,
          toName: student_name,
          subject: "UPDATE: Your Rent Due Date Changed",
          htmlContent: `<div style="padding: 20px; font-family: sans-serif;"><h2>Hello ${student_name},</h2><p>The admin has updated your rent due date schedule.</p><p>Your rent is now strictly due on the <strong>${rent_due_day}</strong> of every month.</p><p>Please log into your resident dashboard to view the changes.</p></div>`
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}