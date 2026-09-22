import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Next.js config: allow function to run up to 60 seconds for paced requests
export const maxDuration = 60;

// Configuration Safeguards
const DAILY_SMS_LIMIT = 85;      // Leaves a 15-SMS buffer for personal usage
const PACING_DELAY_MS = 1800;    // 1.8-second delay between individual texts

const SMS_GATEWAY_URL = "YOUR_SMS_GATEWAY_ENDPOINT_HERE";
const SMS_API_KEY = "YOUR_API_KEY_HERE";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 1. Check how many SMS have already been sent today
    const { data: sentTodayList, error: countError } = await supabase
      .from("students")
      .select("id")
      .gte("last_sms_sent_at", todayStart.toISOString());

    if (countError) throw countError;

    const usedToday = sentTodayList ? sentTodayList.length : 0;
    const remainingQuota = Math.max(0, DAILY_SMS_LIMIT - usedToday);

    if (remainingQuota === 0) {
      return NextResponse.json({
        success: false,
        message: `Daily safety limit reached (${DAILY_SMS_LIMIT}/${DAILY_SMS_LIMIT}). The remaining students will be texted tomorrow after midnight.`,
        usedToday,
        remainingQuota: 0,
      });
    }

    // 2. Fetch unpaid students who haven't received an SMS today
    const { data: pendingStudents, error: fetchError } = await supabase
      .from("students")
      .select("*")
      .eq("fee_paid_this_month", false)
      .or(`last_sms_sent_at.is.null,last_sms_sent_at.lt.${todayStart.toISOString()}`)
      .order("admission_date", { ascending: true }); // Oldest admissions prioritized first

    if (fetchError) throw fetchError;

    if (!pendingStudents || pendingStudents.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending reminders require dispatch today.",
        usedToday,
        remainingQuota,
      });
    }

    // 3. Slice array to strictly respect remaining daily quota
    const studentsToText = pendingStudents.slice(0, remainingQuota);
    const deferredCount = pendingStudents.length - studentsToText.length;

    let dispatchedCount = 0;

    for (const student of studentsToText) {
      const cleanPhone = student.phone.replace(/\D/g, "");
      const message = `Lakshya PG Reminder: Your fee of ₹${student.monthly_fee} is due. Please clear it at your earliest convenience.`;

      try {
        const smsResponse = await fetch(SMS_GATEWAY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SMS_API_KEY}`,
          },
          body: JSON.stringify({
            to: `+91${cleanPhone}`,
            message: message,
          }),
        });

        if (smsResponse.ok) {
          await supabase
            .from("students")
            .update({ last_sms_sent_at: new Date().toISOString() })
            .eq("id", student.id);

          dispatchedCount++;
        }
      } catch (err) {
        console.error(`Failed to send SMS to ${student.name}:`, err);
      }

      // Micro-cooldown between dispatches to keep carrier filters happy
      await sleep(PACING_DELAY_MS);
    }

    return NextResponse.json({
      success: true,
      message: `Dispatched ${dispatchedCount} reminders. ${deferredCount} students held back for tomorrow's quota.`,
      dispatchedCount,
      deferredCount,
      usedToday: usedToday + dispatchedCount,
      remainingQuota: remainingQuota - dispatchedCount,
    });
  } catch (error) {
    console.error("SMS Dispatch Error:", error);
    return NextResponse.json({ success: false, error: "Internal dispatch error" }, { status: 500 });
  }
}