"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, CheckCircle, ShieldCheck, LogOut, UserPlus, Users, UserCheck, AlertCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"pending" | "manual" | "admins" | "residents">("pending");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // States
  const [applications, setApplications] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [adminList, setAdminList] = useState<any[]>([]);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [fees, setFees] = useState<Record<string, string>>({});
  const [editFees, setEditFees] = useState<Record<string, string>>({});
  const [editDueDates, setEditDueDates] = useState<Record<string, string>>({});
  const [newAdminEmail, setNewAdminEmail] = useState("");
  
  const [manualForm, setManualForm] = useState({
    name: "", email: "", room: "", monthlyFee: "", sharingType: "Double Sharing", dob: "", fatherName: "", motherName: "", phone: "", parentPhone: "", aadhaar: "", coaching: "", address: "", disease: ""
  });
  const [addingManual, setAddingManual] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [appRes, resRes, admRes] = await Promise.all([
        fetch(`/api/admins/applications?t=${Date.now()}`),
        fetch(`/api/admins/residents?t=${Date.now()}`),
        fetch(`/api/admins?t=${Date.now()}`)
      ]);

      if (appRes.ok) {
        const appData = await appRes.json();
        if (appData.success) setApplications(appData.applications);
      }
      if (resRes.ok) {
        const resData = await resRes.json();
        if (resData.success) {
          setResidents(resData.residents);
          const feeMap: Record<string, string> = {};
          const dateMap: Record<string, string> = {};
          resData.residents.forEach((r: any) => {
            feeMap[r.id] = r.monthly_fee || "";
            dateMap[r.id] = r.rent_due_day || "";
          });
          setEditFees(feeMap);
          setEditDueDates(dateMap);
        }
      }
      if (admRes.ok) {
        const admData = await admRes.json();
        if (Array.isArray(admData)) setAdminList(admData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* --- ACTIONS --- */
  const handleApprove = async (id: string) => {
    const fee = fees[id];
    if (!fee) return alert("Please enter a monthly fee for this student.");
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admins/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, monthlyFee: fee }) });
      if (res.ok) { fetchAllData(); setExpandedId(null); }
    } finally { setUpdatingId(null); }
  };

  const handleToggleFeeStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    setUpdatingId(id + 'status');
    try {
      const res = await fetch("/api/admins/residents", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, fee_status: newStatus }) });
      if (res.ok) fetchAllData();
    } finally { setUpdatingId(null); }
  };

  const handleUpdateFeeAmount = async (resident: any) => {
    const newFee = editFees[resident.id];
    if (window.confirm(`Are you sure you want to change the fee to ₹${newFee}? This will email the student.`)) {
      setUpdatingId(resident.id + 'fee');
      try {
        const res = await fetch("/api/admins/residents", { 
          method: "PATCH", headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ id: resident.id, monthly_fee: newFee, student_email: resident.email, student_name: resident.name }) 
        });
        if (res.ok) { alert("Fee updated and student notified!"); fetchAllData(); }
      } finally { setUpdatingId(null); }
    }
  };

  const handleUpdateDueDate = async (resident: any) => {
    const newDate = editDueDates[resident.id];
    if (window.confirm(`Change rent due date to the ${newDate}th of every month? This will email the student.`)) {
      setUpdatingId(resident.id + 'date');
      try {
        const res = await fetch("/api/admins/residents", { 
          method: "PATCH", headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ id: resident.id, rent_due_day: newDate, student_email: resident.email, student_name: resident.name }) 
        });
        if (res.ok) { alert("Due date updated and student notified!"); fetchAllData(); }
      } finally { setUpdatingId(null); }
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingManual(true);
    try {
      const res = await fetch("/api/admins/manual-add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(manualForm) });
      if (res.ok) {
        alert("Student added successfully!");
        setManualForm({ name: "", email: "", room: "", monthlyFee: "", sharingType: "Double Sharing", dob: "", fatherName: "", motherName: "", phone: "", parentPhone: "", aadhaar: "", coaching: "", address: "", disease: "" });
        fetchAllData();
      }
    } finally { setAddingManual(false); }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newAdminEmail }) });
    if (res.ok) { setNewAdminEmail(""); fetchAllData(); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-slate-900 text-white px-6 py-8 md:px-12 flex justify-between items-center shadow-lg">
        <div><h1 className="text-2xl font-bold tracking-tight">Master Dashboard</h1><p className="text-slate-400 text-sm mt-1">Lakshya PG Management System</p></div>
        <button onClick={() => { localStorage.removeItem("userEmail"); router.push("/"); }} className="flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto mb-8 pb-2 border-b border-slate-200">
          <button onClick={() => setActiveTab("pending")} className={`px-4 md:px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === "pending" ? "bg-white text-blue-600 border-t border-l border-r" : "text-slate-500 hover:bg-slate-200/50"}`}><ShieldCheck className="w-5 h-5" /> Pending ({applications.length})</button>
          <button onClick={() => setActiveTab("residents")} className={`px-4 md:px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === "residents" ? "bg-white text-blue-600 border-t border-l border-r" : "text-slate-500 hover:bg-slate-200/50"}`}><UserCheck className="w-5 h-5" /> Manage Residents ({residents.length})</button>
          <button onClick={() => setActiveTab("manual")} className={`px-4 md:px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === "manual" ? "bg-white text-blue-600 border-t border-l border-r" : "text-slate-500 hover:bg-slate-200/50"}`}><UserPlus className="w-5 h-5" /> Add Offline</button>
          <button onClick={() => setActiveTab("admins")} className={`px-4 md:px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === "admins" ? "bg-white text-blue-600 border-t border-l border-r" : "text-slate-500 hover:bg-slate-200/50"}`}><Users className="w-5 h-5" /> Admins</button>
        </div>

        {/* PENDING TAB */}
        {activeTab === "pending" && (
          <div>
            {applications.length === 0 ? <div className="bg-white rounded-2xl border p-12 text-center"><CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" /><h3 className="text-lg font-bold">All caught up!</h3></div> : (
              <div className="bg-white rounded-2xl border shadow-sm">
                {applications.map((app) => (
                  <div key={app.id} className="border-b p-6">
                    <h3 className="font-bold text-lg">{app.name}</h3>
                    <p className="text-sm text-slate-500">{app.email} • {app.phone}</p>
                    <div className="flex gap-4 mt-4 items-center">
                      <input type="number" placeholder="Set Fee (₹)" value={fees[app.id] || ""} onChange={e => setFees({...fees, [app.id]: e.target.value})} className="border p-2 rounded outline-none font-bold max-w-xs" />
                      <button onClick={() => handleApprove(app.id)} disabled={updatingId === app.id} className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700">{updatingId === app.id ? "Approving..." : "Approve"}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESIDENTS TAB */}
        {activeTab === "residents" && (
          <div>
            {residents.length === 0 ? <div className="bg-white rounded-2xl border p-12 text-center"><h3 className="text-lg font-bold">No active residents yet.</h3></div> : (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                {residents.map((app) => (
                  <div key={app.id} className="border-b border-slate-100 last:border-0">
                    <button onClick={() => setExpandedId(expandedId === app.id ? null : app.id)} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 text-left">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{app.name}</h3>
                          <p className="text-sm text-slate-500">Room: <strong>{app.room || "Unassigned"}</strong></p>
                        </div>
                        {app.fee_status === 'paid' ? <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Paid</span> : <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">Payment Due</span>}
                      </div>
                      <ChevronDown className={`w-6 h-6 text-slate-400 ${expandedId === app.id ? "rotate-180" : ""}`} />
                    </button>
                    
                    <AnimatePresence>
                      {expandedId === app.id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-slate-50/50">
                          <div className="p-6 border-t border-slate-100">
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
                              <div><p className="font-bold text-slate-400 uppercase text-xs">Email</p><p className="font-bold text-slate-900">{app.email}</p></div>
                              <div><p className="font-bold text-slate-400 uppercase text-xs">Phone</p><p className="font-bold text-slate-900">{app.phone || "N/A"}</p></div>
                              <div><p className="font-bold text-slate-400 uppercase text-xs">Parent Phone</p><p className="font-bold text-slate-900">{app.parent_phone || "N/A"}</p></div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 text-orange-500"/> Administrative Actions (Triggers Emails to Student)</h4>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Toggle Payment */}
                                <div className="bg-slate-50 p-4 rounded-lg border flex flex-col justify-between">
                                  <p className="text-xs font-bold text-slate-500 uppercase">Rent Status</p>
                                  <button onClick={() => handleToggleFeeStatus(app.id, app.fee_status)} disabled={updatingId === app.id + 'status'} className={`w-full mt-4 py-2 rounded-lg font-bold text-sm ${app.fee_status === 'paid' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {updatingId === app.id + 'status' ? "Updating..." : (app.fee_status === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid')}
                                  </button>
                                </div>

                                {/* Update Fee */}
                                <div className="bg-slate-50 p-4 rounded-lg border flex flex-col justify-between">
                                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Adjust Fee (₹)</p>
                                  <div className="flex gap-2">
                                    <input type="number" value={editFees[app.id] || ""} onChange={e => setEditFees({ ...editFees, [app.id]: e.target.value })} className="w-full p-2 border rounded outline-none font-bold" />
                                    <button onClick={() => handleUpdateFeeAmount(app)} disabled={updatingId === app.id + 'fee' || editFees[app.id] === app.monthly_fee} className="bg-slate-900 text-white px-4 rounded font-bold text-sm disabled:opacity-50"><Mail className="w-4 h-4"/></button>
                                  </div>
                                </div>

                                {/* Update Due Date */}
                                <div className="bg-slate-50 p-4 rounded-lg border flex flex-col justify-between">
                                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Rent Due Date (1-31)</p>
                                  <div className="flex gap-2">
                                    <input type="number" placeholder="e.g. 5" value={editDueDates[app.id] || ""} onChange={e => setEditDueDates({ ...editDueDates, [app.id]: e.target.value })} className="w-full p-2 border rounded outline-none font-bold" />
                                    <button onClick={() => handleUpdateDueDate(app)} disabled={updatingId === app.id + 'date' || editDueDates[app.id] === (app.rent_due_day || "")} className="bg-slate-900 text-white px-4 rounded font-bold text-sm disabled:opacity-50"><Mail className="w-4 h-4"/></button>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OMITTED MANUAL ADD & ADMINS TO SAVE SPACE - KEEP YOUR EXISTING CODE FOR TABS 3 AND 4 HERE */}
      </div>
    </div>
  );
}