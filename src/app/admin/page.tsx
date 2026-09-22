"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, AlertCircle, Calendar, IndianRupee, Smartphone, Settings2, Bell, Loader2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Student {
  id: string;
  name: string;
  room: string;
  phone: string;
  admission_date: string;
  deposit_eligibility_date: string;
  monthly_fee: number;
  fee_paid_this_month: boolean;
  last_sms_sent_at: string | null;
}

const easeCurve = [0.22, 1, 0.36, 1] as const;

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [reminderDaysPrior, setReminderDaysPrior] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setStudents(data as Student[]);
      
      const savedReminder = localStorage.getItem("lakshya_settings_reminder");
      if (savedReminder) setReminderDaysPrior(Number(savedReminder));
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    localStorage.setItem("lakshya_settings_reminder", reminderDaysPrior.toString());
  }, [reminderDaysPrior]);

  const calculateDepositDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setMonth(date.getMonth() + 9);
    return date.toISOString().split('T')[0];
  };

  const getNextDueDate = (admissionDate: string) => {
    const today = new Date();
    const adDate = new Date(admissionDate);
    let nextDue = new Date(today.getFullYear(), today.getMonth(), adDate.getDate());
    if (nextDue < today) nextDue.setMonth(nextDue.getMonth() + 1);
    return nextDue;
  };

  const isReminderDue = (student: Student) => {
    if (student.fee_paid_this_month) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dueDate = getNextDueDate(student.admission_date); dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= reminderDaysPrior;
  };

  // Add to Supabase
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !room || !phone || !admissionDate || !monthlyFee) return;

    const newStudent = {
      name, 
      room, 
      phone, 
      admission_date: admissionDate,
      deposit_eligibility_date: calculateDepositDate(admissionDate),
      monthly_fee: Number(monthlyFee),
      fee_paid_this_month: false,
      last_sms_sent_at: null
    };

    try {
      const { data, error } = await supabase.from('students').insert([newStudent]).select().single();
      if (error) throw error;
      if (data) {
        setStudents([data as Student, ...students]);
        setName(""); setRoom(""); setPhone(""); setAdmissionDate(""); setMonthlyFee("");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Check database connection.");
    }
  };

  // Update Status in Supabase
  const toggleFeeStatus = async (id: string, currentStatus: boolean) => {
    try {
      await supabase.from('students').update({ fee_paid_this_month: !currentStatus }).eq('id', id);
      setStudents(students.map(s => s.id === id ? { ...s, fee_paid_this_month: !currentStatus } : s));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Delete from Supabase
  const deleteStudent = async (id: string) => {
    try {
      await supabase.from('students').delete().eq('id', id);
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Trigger the API Route to send SMS via Android Phone
  const triggerAutoReminders = async () => {
    if (!confirm("This will silently dispatch SMS reminders from the gateway phone. Proceed?")) return;
    
    setIsSendingSMS(true);
    try {
      const res = await fetch("/api/send-reminders", { method: "POST" });
      const data = await res.json();
      alert(data.message);
      fetchStudents(); // Refresh to show new timestamps
    } catch (error) {
      alert("Failed to connect to the SMS server.");
    }
    setIsSendingSMS(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F8] text-zinc-950 pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header & Global Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4 block">
              Supabase Admin // Rate Protected
            </span>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-zinc-950 leading-[1.1]">
              Resident <span className="text-zinc-400">Ledger.</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Auto-Flag Setting */}
            <div className="bg-white p-3 rounded-2xl border shadow-sm flex items-center gap-3">
              <Settings2 className="w-4 h-4 text-zinc-400" />
              <div className="flex items-center gap-2">
                <input type="number" value={reminderDaysPrior} onChange={(e) => setReminderDaysPrior(Number(e.target.value))} className="w-12 bg-zinc-50 border rounded-lg px-2 py-1 text-xs text-center" min="0" max="15" />
                <span className="text-xs font-medium text-zinc-500">days prior</span>
              </div>
            </div>

            {/* Safety Monitor Badge */}
            <div className="bg-white border border-zinc-200 px-5 py-3 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">SIM Daily Quota</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-semibold text-zinc-900">
                  {students.filter(s => s.last_sms_sent_at && new Date(s.last_sms_sent_at).toDateString() === new Date().toDateString()).length} / 85
                </span>
                <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Safe Limit</span>
              </div>
            </div>

            {/* Dispatch Button */}
            <button 
              onClick={triggerAutoReminders}
              disabled={isSendingSMS}
              className="bg-zinc-950 text-white px-6 py-4 rounded-2xl text-sm font-bold tracking-wide flex items-center gap-3 hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-xl shadow-black/10"
            >
              {isSendingSMS ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isSendingSMS ? "Pacing Dispatches..." : "Dispatch SMS"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Onboard Form */}
          <div className="lg:col-span-4 bg-white p-8 rounded-3xl border shadow-sm sticky top-32">
            <h2 className="text-xl font-medium tracking-tight mb-6">Onboard New Resident</h2>
            <form onSubmit={handleAddStudent} className="flex flex-col gap-5">
              <div>
                <label className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase block mb-2">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-zinc-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-950" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase block mb-2">Room No.</label>
                  <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} required className="w-full bg-zinc-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-950" />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase block mb-2">Monthly Fee (₹)</label>
                  <input type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} required className="w-full bg-zinc-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-950" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase block mb-2">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={10} className="w-full bg-zinc-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-950" />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase block mb-2">Date of Admission</label>
                <input type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} required className="w-full bg-zinc-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-950" />
              </div>
              <button type="submit" className="mt-4 w-full bg-zinc-950 text-white rounded-xl py-4 text-xs font-bold tracking-[0.1em] uppercase hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Save to Database
              </button>
            </form>
          </div>

          {/* Roster Database */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {students.length === 0 ? (
              <div className="w-full h-64 border border-dashed border-zinc-300 rounded-3xl flex flex-col items-center justify-center text-zinc-400">
                <p className="text-sm font-medium text-zinc-500">Database is empty.</p>
              </div>
            ) : (
              <AnimatePresence>
                {students.map((student) => {
                  const reminderDue = isReminderDue(student);
                  
                  return (
                    <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, ease: easeCurve }}
                      className={`bg-white border p-6 rounded-3xl shadow-sm flex flex-col gap-6 transition-all ${reminderDue ? "border-red-300 shadow-red-100" : "border-zinc-200"}`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-medium">{student.name}</h3>
                            <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-xs font-bold">Room {student.room}</span>
                            {reminderDue && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse"><Bell className="w-3 h-3" /> Action Required</span>}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 mt-3">
                            <div className="flex items-center gap-1.5"><IndianRupee className="w-3 h-3" /> ₹{student.monthly_fee}/mo</div>
                            <div className="flex items-center gap-1.5"><Smartphone className="w-3 h-3" /> +91 {student.phone}</div>
                            <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Due: {getNextDueDate(student.admission_date).toLocaleDateString('en-GB')}</div>
                          </div>

                          {/* SMS Tracking Indicator */}
                          <div className="mt-4">
                            {student.last_sms_sent_at ? (
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">
                                ✓ Last SMS Sent: {new Date(student.last_sms_sent_at).toLocaleString('en-GB')}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-1 rounded">
                                No SMS sent yet
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => deleteStudent(student.id)} className="text-zinc-400 hover:text-red-600 text-xs underline">Remove</button>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-3 border-t border-zinc-100 pt-4">
                        <button onClick={() => toggleFeeStatus(student.id, student.fee_paid_this_month)}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border ${student.fee_paid_this_month ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                          {student.fee_paid_this_month ? <><Check className="w-4 h-4" /> Paid (Cloud Sync)</> : <><AlertCircle className="w-4 h-4" /> Mark Paid</>}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>
    </div>
  );
} 