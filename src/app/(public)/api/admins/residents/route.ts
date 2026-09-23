import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
    const body = await req.json();
    const { 
      id, 
      name, 
      email, 
      phone, 
      parent_phone, 
      dob, 
      father_name,
      mother_name,
      coaching,
      disease,
      address, 
      room, 
      sharing_type, 
      monthly_fee, 
      fee_status, 
      rent_due_day, 
      paid_till 
    } = body;
    
    const updates: any = {};
    if (name !== undefined) updates.name = name === "" ? null : name;
    if (email !== undefined) updates.email = email === "" ? null : email;
    if (phone !== undefined) updates.phone = phone === "" ? null : phone;
    if (parent_phone !== undefined) updates.parent_phone = parent_phone === "" ? null : parent_phone;
    if (dob !== undefined) updates.dob = dob === "" ? null : dob;
    if (father_name !== undefined) updates.father_name = father_name === "" ? null : father_name;
    if (mother_name !== undefined) updates.mother_name = mother_name === "" ? null : mother_name;
    if (coaching !== undefined) updates.coaching = coaching === "" ? null : coaching;
    if (disease !== undefined) updates.disease = disease === "" ? null : disease;
    if (address !== undefined) updates.address = address === "" ? null : address;
    if (room !== undefined) updates.room = room === "" ? null : room;
    if (sharing_type !== undefined) updates.sharing_type = sharing_type;
    if (monthly_fee !== undefined) updates.monthly_fee = monthly_fee === "" ? null : Number(monthly_fee);
    if (fee_status !== undefined) updates.fee_status = fee_status;
    if (rent_due_day !== undefined) updates.rent_due_day = rent_due_day === "" ? null : Number(rent_due_day);
    if (paid_till !== undefined) updates.paid_till = paid_till;

    const { error } = await supabase.from("students").update(updates).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Residents PATCH Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Resident ID is required." }, { status: 400 });
    }

    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Residents DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}