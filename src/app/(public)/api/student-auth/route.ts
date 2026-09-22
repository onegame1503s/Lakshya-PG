import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const { action, email, otp } = await req.json();

    // ACTION 1: Request OTP
    if (action === "request_otp") {
      // Check if student exists in database
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !student) {
        return NextResponse.json({ success: false, error: "Email not found in resident ledger." }, { status: 404 });
      }

      // Generate a random 6-digit OTP code
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // Valid for 10 mins

      // Save OTP to Supabase
      await supabase
        .from("students")
        .update({ otp_code: generatedOtp, otp_expires_at: expiresAt })
        .eq("id", student.id);

      // Send OTP via Brevo
      await sendBrevoEmail({
        toEmail: student.email,
        toName: student.name,
        subject: "Your Login Verification Code - Lakshya PG",
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; color: #111;">
            <h2>Hello ${student.name},</h2>
            <p>Your secure login code for the Lakshya PG Student Portal is:</p>
            <h1 style="background: #f4f4f5; padding: 10px 20px; display: inline-block; letter-spacing: 4px;">${generatedOtp}</h1>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true, message: "OTP sent successfully to your email." });
    }

    // ACTION 2: Verify OTP
    if (action === "verify_otp") {
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !student) {
        return NextResponse.json({ success: false, error: "Invalid session." }, { status: 400 });
      }

      if (student.otp_code !== otp) {
        return NextResponse.json({ success: false, error: "Incorrect verification code." }, { status: 400 });
      }

      if (new Date() > new Date(student.otp_expires_at)) {
        return NextResponse.json({ success: false, error: "OTP has expired. Request a new one." }, { status: 400 });
      }

      // Clear OTP after successful login
      await supabase
        .from("students")
        .update({ otp_code: null, otp_expires_at: null })
        .eq("id", student.id);

      return NextResponse.json({ success: true, student });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });

  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ success: false, error: "Server authentication error." }, { status: 500 });
  }
}