import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendBrevoEmail } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action;
    const email = body.email ? body.email.trim().toLowerCase() : "";
    const otp = body.otp;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }

    // -------------------------------------------------------------
    // PHASE 1: SENDING THE OTP
    // -------------------------------------------------------------
    if (action === "request_otp") {
      // 1. Check Admins First
      const { data: admin } = await supabase.from("admins").select("*").eq("email", email).maybeSingle();
      
      // 2. Check Students Second (Only if Approved)
      const { data: student } = await supabase.from("students").select("*").eq("email", email).eq("status", "approved").maybeSingle();

      if (!admin && !student) {
        return NextResponse.json({ success: false, error: "Either you are not a part of the hostel or you are not yet approved by the admin." }, { status: 404 });
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const userName = admin ? "Admin" : student.name;

      // Save OTP to the correct table
      if (admin) {
         await supabase.from("admins").update({ otp_code: generatedOtp, otp_expires_at: expiresAt }).eq("id", admin.id);
      } else if (student) {
         await supabase.from("students").update({ otp_code: generatedOtp, otp_expires_at: expiresAt }).eq("id", student.id);
      }

      // Send the Email via Brevo
      await sendBrevoEmail({
        toEmail: email,
        toName: userName,
        subject: "Your Lakshya PG Login Code",
        htmlContent: `<div style="font-family: sans-serif; padding: 20px;"><h2>Hello ${userName},</h2><p>Your secure login code is:</p><h1 style="background: #f4f4f5; padding: 10px 20px; display: inline-block; letter-spacing: 4px;">${generatedOtp}</h1><p>Valid for 10 minutes.</p></div>`,
      });

      return NextResponse.json({ success: true, message: "OTP sent successfully." });
    }

    // -------------------------------------------------------------
    // PHASE 2: VERIFYING THE OTP
    // -------------------------------------------------------------
    if (action === "verify_otp") {
      // 1. Verify Admin
      const { data: admin } = await supabase.from("admins").select("*").eq("email", email).maybeSingle();
      
      if (admin) {
        if (admin.otp_code === otp && new Date(admin.otp_expires_at) > new Date()) {
          // Clear OTP after success
          await supabase.from("admins").update({ otp_code: null, otp_expires_at: null }).eq("id", admin.id);
          return NextResponse.json({ success: true, role: "admin" });
        } else {
          return NextResponse.json({ success: false, error: "Invalid or expired OTP." }, { status: 400 });
        }
      }

      // 2. Verify Student
      const { data: student } = await supabase.from("students").select("*").eq("email", email).eq("status", "approved").maybeSingle();

      if (student) {
         if (student.otp_code === otp && new Date(student.otp_expires_at) > new Date()) {
           // Clear OTP after success
           await supabase.from("students").update({ otp_code: null, otp_expires_at: null }).eq("id", student.id);
           return NextResponse.json({ success: true, role: "student" });
         } else {
           return NextResponse.json({ success: false, error: "Invalid or expired OTP." }, { status: 400 });
         }
      }

      return NextResponse.json({ success: false, error: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}