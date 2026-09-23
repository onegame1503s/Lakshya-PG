import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { studentName, studentEmail, room, issue, fileBase64, fileName } = await req.json();

    // 1. Fetch all admin emails from the database
    const { data: admins, error } = await supabase.from("admins").select("email");
    if (error) throw error;

    if (!admins || admins.length === 0) {
      return NextResponse.json({ success: false, error: "No admins found in system." }, { status: 404 });
    }

    const adminEmails = admins.map((admin) => ({ email: admin.email }));

    // 2. Prepare the attachment (Extract the raw base64 string if it exists)
    let attachmentContent = undefined;
    if (fileBase64) {
      // Data URLs look like: "data:image/png;base64,iVBORw0KGgo..."
      // Brevo only wants the string after the comma.
      attachmentContent = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
    }

    // 3. Send email to ALL admins using direct Brevo API (to support attachments safely)
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY as string,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Lakshya PG System", email: "noreply@lakshyapg.com" },
        to: adminEmails,
        subject: `🚨 New Concern Raised by ${studentName} (Room ${room || "Unassigned"})`,
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #dc2626;">Resident Issue Reported</h2>
            <p><strong>Resident:</strong> ${studentName} (${studentEmail})</p>
            <p><strong>Room:</strong> ${room || "N/A"}</p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h4 style="margin-top: 0;">Issue Description:</h4>
              <p style="white-space: pre-wrap;">${issue}</p>
            </div>
            ${fileBase64 ? `<p style="margin-top: 20px; font-size: 12px; color: #64748b;">📎 An attachment was included with this report.</p>` : ''}
          </div>
        `,
        attachment: attachmentContent ? [{ content: attachmentContent, name: fileName }] : undefined
      }),
    });

    if (!brevoRes.ok) {
      const errData = await brevoRes.json();
      console.error("Brevo Error:", errData);
      throw new Error("Failed to send email via Brevo.");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}