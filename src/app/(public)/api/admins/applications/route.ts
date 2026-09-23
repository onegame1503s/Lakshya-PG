import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendBrevoEmail } from "@/lib/brevo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET pending applications
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, applications: data }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error: any) {
    console.error("Fetch Applications GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST to approve an application
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Applications POST body received:", body);
    
    const id = body.id || body.applicationId;

    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID is required in request body" }, { status: 400 });
    }

    // 1. Update student status to approved in Supabase
    const { data: updatedStudent, error: updateError } = await supabase
      .from("students")
      .update({ 
        status: "approved",
        fee_status: "unpaid",
        rent_due_day: 5,
        admission_date: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase Approve Update Error:", updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 2. Send approval email via Brevo (Isolated in try/catch so it never blocks approval)
    if (updatedStudent && updatedStudent.email) {
      try {
        await sendBrevoEmail({
          toEmail: updatedStudent.email,
          toName: updatedStudent.name,
          subject: "🎉 Welcome to Lakshya PG - Application Approved!",
          htmlContent: `
            <div style="font-family: sans-serif; padding: 20px; max-width: 600px;">
              <h2 style="color: #2563eb;">Application Approved!</h2>
              <p>Hello <strong>${updatedStudent.name}</strong>,</p>
              <p>Your application for Lakshya PG has been successfully approved by the administration.</p>
              <p>You can now log in to your Resident Portal using your registered email address.</p>
              <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
                <p style="margin: 0;"><strong>Assigned Room:</strong> ${updatedStudent.room || "TBA"}</p>
                <p style="margin: 5px 0 0 0;"><strong>Monthly Fee:</strong> ₹${updatedStudent.monthly_fee || "8500"}</p>
              </div>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Approval Email Warning:", emailErr);
      }
    }

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error: any) {
    console.error("Applications POST Catch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}