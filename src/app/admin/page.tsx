"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Shield, Users, UserPlus, CheckCircle, XCircle, LogOut, Loader2, DollarSign, Calendar, Home, Mail, Plus } from "lucide-react";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"residents" | "applications" | "manual" | "admins">("residents");
  const [residents, setResidents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const router = useRouter();

  // Manual Add Form State
  const [manualForm, setManualForm] = useState({
    name: "", email: "", phone: "", parent_phone: "", dob: "", aadhaar: "", address: "", room: "", sharing_type: "Double Sharing", monthly_fee: "8500"
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const checkAdminAuth = useCallback(async () => {
    const email = localStorage.getItem("userEmail");
    if (!email) return router.push("/");

    const { data } = await supabase.from("admins").select("email").eq("email", email).single();
    if (data) {
      setIsAdmin(true);
      fetchData();
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const fetchData = async () => {
    // Fetch Residents
    const resRes = await fetch("/api/admins/residents");
    const resData = await resRes.json();
    if (resData.success) setResidents(resData.residents);

    // Fetch Applications
    const appRes = await fetch("/api/admins/applications");
    const appData = await appRes.json();
    if (appData.success) setApplications(appData.applications);

    // Fetch Admins
    const adminRes = await fetch("/api/admins/manage");
    const adminData = await adminRes.json();
    if (adminData.success) setAdminsList(adminData.admins);
  };

  const handleUpdateResident = async (id: string, updates: any, email: string, name: string) => {
    try {
      const res = await fetch("/api/admins/residents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates, student_email: email, student_name: name })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchData();
      } else {
        alert("Failed to update: " + (data.error || "Unknown server error"));
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    }
  };

  const handleApproveApplication = async (app: any) => {
    const res = await fetch("/api/admins/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: app.id, status: "approved" })
    });
    if (res.ok) fetchData();
    else alert("Failed to approve application");
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualSubmitting(true);
    const res = await fetch("/api/admins/manual-add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(manualForm)
    });
    const data = await res.json();
    setManualSubmitting(false);
    if (data.success) {
      alert("Student added successfully!");
      setManualForm({ name: "", email: "", phone: "", parent_phone: "", dob: "", aadhaar: "", address: "", room: "", sharing_type: "Double Sharing", monthly_fee: "8500" });
      fetchData();
      setActiveTab("residents");
    } else {
      alert("Error: " + data.error);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    const res = await fetch("/api/admins/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newAdminEmail })
    });
    const data = await res.json();
    if (data.success) {
      alert("New admin added successfully!");
      setNewAdminEmail("");
      fetchData();
    } else {
      alert("Error: " + data.error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      
      {/* Top Header */}
      <div className="bg-slate-900 text-white px-8 py-6 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl"><Shield className="w-6 h-6"/></div>
          <div><h1 className="text-xl font-black">Lakshya Admin Portal</h1><p className="text-xs text-slate-400">Management & Control Center</p></div>
        </div>
        <button onClick={() => { localStorage.clear(); router.push("/"); }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"><LogOut className="w-4 h-4"/> Logout</button>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 pb-4 overflow-x-auto">
          <button onClick={() => setActiveTab("residents")} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'residents' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><Users className="w-4 h-4"/> Manage Residents ({residents.length})</button>
          <button onClick={() => setActiveTab("applications")} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'applications' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><CheckCircle className="w-4 h-4"/> Pending Applications ({applications.length})</button>
          <button onClick={() => setActiveTab("manual")} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'manual' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><UserPlus className="w-4 h-4"/> Manually Add Student</button>
          <button onClick={() => setActiveTab("admins")} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'admins' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><Shield className="w-4 h-4"/> Admin Access</button>
        </div>

        {/* 1. RESIDENTS TAB */}
        {activeTab === "residents" && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 overflow-hidden">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Active Residents List</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                    <th className="pb-4">Resident</th>
                    <th className="pb-4">Room No.</th>
                    <th className="pb-4">Monthly Fee</th>
                    <th className="pb-4">Due Date</th>
                    <th className="pb-4">Fee Status (Advance)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {residents.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-bold text-slate-900">{r.name}<span className="block text-xs font-normal text-slate-500">{r.email}</span></td>
                      {/* Room Edit */}
                      <td className="py-4">
                        <input type="text" defaultValue={r.room || ""} onBlur={(e) => handleUpdateResident(r.id, { room: e.target.value }, r.email, r.name)} className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Room"/>
                      </td>
                      {/* Fee Edit */}
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-slate-400"/>
                          <input type="number" defaultValue={r.monthly_fee} onBlur={(e) => handleUpdateResident(r.id, { monthly_fee: e.target.value }, r.email, r.name)} className="w-28 p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                      </td>
                      {/* Due Date Edit */}
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-slate-400"/>
                          <select defaultValue={r.rent_due_day || 5} onChange={(e) => handleUpdateResident(r.id, { rent_due_day: parseInt(e.target.value) }, r.email, r.name)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none">
                            {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}th</option>)}
                          </select>
                        </div>
                      </td>
                      {/* Smart Advance Payment Button with Clear Date Formatting */}
                      <td className="py-4">
                        <button 
                          onClick={() => {
                            const now = new Date();
                            const targetMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                            const dueDay = r.rent_due_day || 5;
                            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                            
                            const getOrdinalSuffix = (n: number) => {
                              const s = ["th", "st", "nd", "rd"];
                              const v = n % 100;
                              return n + (s[(v - 20) % 10] || s[v] || s[0]);
                            };

                            const paidTillString = `${getOrdinalSuffix(dueDay)} ${monthNames[targetMonth.getMonth()]} ${targetMonth.getFullYear()}`;
                            
                            const newStatus = r.fee_status === 'paid' ? 'unpaid' : 'paid';
                            const newPaidTill = newStatus === 'paid' ? paidTillString : null;

                            handleUpdateResident(r.id, { fee_status: newStatus, paid_till: newPaidTill }, r.email, r.name);
                          }} 
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${r.fee_status === 'paid' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          {r.fee_status === 'paid' ? `✨ Paid till ${r.paid_till || 'Next Month'}` : 'Mark Advance Paid'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. APPLICATIONS TAB */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Pending Student Applications</h2>
            {applications.length === 0 ? <p className="text-slate-400 text-sm">No pending applications.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {applications.map((app) => (
                  <div key={app.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{app.name}</h3>
                      <p className="text-xs text-blue-600 font-mono mb-4">{app.email} • {app.phone}</p>
                      <p className="text-sm text-slate-600 mb-2"><strong>Room Preference:</strong> {app.sharing_type}</p>
                      <p className="text-sm text-slate-600 mb-4"><strong>Address:</strong> {app.address}</p>
                    </div>
                    <button onClick={() => handleApproveApplication(app)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20">Approve Resident</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. MANUALLY ADD STUDENT TAB */}
        {activeTab === "manual" && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Manually Add Resident</h2>
            <p className="text-sm text-slate-500 mb-8">Directly onboard a resident into the system without an application.</p>
            
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Full Name</label>
                  <input type="text" required placeholder="John Doe" value={manualForm.name} onChange={(e) => setManualForm({...manualForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Address</label>
                  <input type="email" required placeholder="john@example.com" value={manualForm.email} onChange={(e) => setManualForm({...manualForm, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Phone Number</label>
                  <input type="text" required placeholder="9876543210" value={manualForm.phone} onChange={(e) => setManualForm({...manualForm, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Parent's Phone</label>
                  <input type="text" required placeholder="9876543210" value={manualForm.parent_phone} onChange={(e) => setManualForm({...manualForm, parent_phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Date of Birth</label>
                  <input type="text" placeholder="DD/MM/YYYY" value={manualForm.dob} onChange={(e) => setManualForm({...manualForm, dob: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Gov ID</label>
                  <input type="text" placeholder="XXXX XXXX XXXX" value={manualForm.aadhaar} onChange={(e) => setManualForm({...manualForm, aadhaar: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Room Number</label>
                  <input type="text" placeholder="e.g. 102" value={manualForm.room} onChange={(e) => setManualForm({...manualForm, room: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Monthly Fee (₹)</label>
                  <input type="number" required value={manualForm.monthly_fee} onChange={(e) => setManualForm({...manualForm, monthly_fee: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Permanent Address</label>
                <textarea rows={3} placeholder="Full home address..." value={manualForm.address} onChange={(e) => setManualForm({...manualForm, address: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 resize-none"></textarea>
              </div>
              <button type="submit" disabled={manualSubmitting} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-colors shadow-xl flex justify-center items-center">
                {manualSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : "Onboard Resident"}
              </button>
            </form>
          </div>
        )}

        {/* 4. ADMIN ACCESS MANAGEMENT TAB */}
        {activeTab === "admins" && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Access Control</h2>
            <p className="text-sm text-slate-500 mb-8">Authorize new email addresses to access the admin dashboard.</p>
            
            <form onSubmit={handleAddAdmin} className="flex gap-4 mb-8">
              <input type="email" required placeholder="new-admin@gmail.com" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600"/>
              <button type="submit" className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"><Plus className="w-5 h-5"/> Add Admin</button>
            </form>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Current Authorized Admins</h3>
            <div className="space-y-3">
              {adminsList.map((a) => (
                <div key={a.id || a.email} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600"/>
                  <span className="font-bold text-slate-900">{a.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}