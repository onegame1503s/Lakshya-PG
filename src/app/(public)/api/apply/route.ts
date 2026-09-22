import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const { action, email, name, dob, fatherName, motherName, phone, parentPhone, aadhaar, coaching, address, disease, sharingType, otp } = await req.json();

    if (action === "send_otp") {
      const { data: existing } = await supabase.from("students").select("status").eq("email", email).maybeSingle();

      if (existing && existing.status !== "unverified") {
        return NextResponse.json({ success: false, error: "This email is already registered or pending approval." }, { status: 400 });
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const studentPayload = {
        name, email, dob, father_name: fatherName, mother_name: motherName, phone, parent_phone: parentPhone, aadhaar, coaching, address, disease, sharing_type: sharingType || "Double Sharing", status: "unverified", otp_code: generatedOtp, otp_expires_at: expiresAt,
      };

      if (existing && existing.status === "unverified") {
        await supabase.from("students").update(studentPayload).eq("email", email);
      } else {
        await supabase.from("students").insert([studentPayload]);
      }

      await sendBrevoEmail({
        toEmail: email, toName: name, subject: "Verify Your Lakshya PG Application",
        htmlContent: `<div style="font-family: sans-serif; padding: 20px;"><h2>Hello ${name},</h2><p>Your OTP to verify your application is:</p><h1 style="background: #f4f4f5; padding: 10px 20px; display: inline-block; letter-spacing: 4px;">${generatedOtp}</h1></div>`,
      });

      return NextResponse.json({ success: true });
    }

    if (action === "verify_otp") {
      const { data: student } = await supabase.from("students").select("*").eq("email", email).eq("status", "unverified").maybeSingle();

      if (!student) return NextResponse.json({ success: false, error: "Application record not found." }, { status: 404 });

      if (student.otp_code === otp && new Date(student.otp_expires_at) > new Date()) {
        await supabase.from("students").update({ status: "pending", otp_code: null, otp_expires_at: null }).eq("id", student.id);
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ success: false, error: "Invalid or expired OTP." }, { status: 400 });
      }
    }
    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}