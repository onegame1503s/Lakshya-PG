"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, CheckCircle, ShieldCheck, LogOut, UserPlus, Users, UserCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"pending" | "manual" | "admins" | "residents">("pending");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Pendings State
  const [applications, setApplications] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fees, setFees] = useState<Record<string, string>>({});
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Residents State
  const [residents, setResidents] = useState<any[]>([]);
  const [editFees, setEditFees] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Manual Add State
  const [manualForm, setManualForm] = useState({
    name: "", email: "", room: "", monthlyFee: "", sharingType: "Double Sharing",
    dob: "", fatherName: "", motherName: "", phone: "", parentPhone: "", aadhaar: "", coaching: "", address: "", disease: ""
  });
  const [addingManual, setAddingManual] = useState(false);

  // Admins State
  const [adminList, setAdminList] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  // SAFELY FETCH DATA SO ONE CRASH DOES NOT BREAK THE DASHBOARD
  const fetchAllData = async () => {
    setLoading(true);

    // 1. Fetch Pendings
    try {
      const appRes = await fetch(`/api/admins/applications?t=${Date.now()}`);
      if (appRes.ok) {
        const appData = await appRes.json();
        if (appData.success) setApplications(appData.applications);
      }
    } catch (e) { console.error("Failed to fetch applications:", e); }

    // 2. Fetch Residents
    try {
      const resRes = await fetch(`/api/admins/residents?t=${Date.now()}`);
      if (resRes.ok) {
        const resData = await resRes.json();
        if (resData.success) {
          setResidents(resData.residents);
          const feeMap: Record<string, string> = {};
          resData.residents.forEach((r: any) => feeMap[r.id] = r.monthly_fee);
          setEditFees(feeMap);
        }
      }
    } catch (e) { console.error("Failed to fetch residents:", e); }

    // 3. Fetch Admins
    try {
      const admRes = await fetch(`/api/admins?t=${Date.now()}`);
      if (admRes.ok) {
        const admData = await admRes.json();
        if (Array.isArray(admData)) setAdminList(admData);
      }
    } catch (e) { console.error("Failed to fetch admins:", e); }

    setLoading(false);
  };

  /* --- PENDING ACTIONS --- */
  const handleApprove = async (id: string) => {
    const fee = fees[id];
    if (!fee) return alert("Please enter a monthly fee for this student.");
    setApprovingId(id);
    try {
      const res = await fetch("/api/admins/applications", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, monthlyFee: fee }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData(); 
        setExpandedId(null);
      } else alert(data.error);
    } finally {
      setApprovingId(null);
    }
  };

  /* --- RESIDENT ACTIONS --- */
  const handleToggleFeeStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admins/residents", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, fee_status: newStatus }),
      });
      if (res.ok) fetchAllData();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateFeeAmount = async (id: string) => {
    const newFee = editFees[id];
    if (window.confirm(`Are you sure you want to change this student's monthly fee to ₹${newFee}?`)) {
      setUpdatingId(id);
      try {
        const res = await fetch("/api/admins/residents", {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, monthly_fee: newFee }),
        });
        if (res.ok) {
          alert("Fee updated successfully!");
          fetchAllData();
        }
      } finally {
        setUpdatingId(null);
      }
    }
  };

  /* --- MANUAL ADD ACTIONS --- */
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingManual(true);
    try {
      const res = await fetch("/api/admins/manual-add", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(manualForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("Student added successfully and granted portal access!");
        setManualForm({ name: "", email: "", room: "", monthlyFee: "", sharingType: "Double Sharing", dob: "", fatherName: "", motherName: "", phone: "", parentPhone: "", aadhaar: "", coaching: "", address: "", disease: "" });
        fetchAllData();
      } else alert(data.error);
    } finally {
      setAddingManual(false);
    }
  };

  /* --- ADMIN MANAGEMENT ACTIONS --- */
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newAdminEmail }) });
    if (res.ok) { setNewAdminEmail(""); fetchAllData(); }
  };
  const handleRemoveAdmin = async (email: string) => {
    const res = await fetch("/api/admins", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (res.ok) fetchAllData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-8 md:px-12 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Lakshya PG Management System</p>
        </div>
        <button onClick={() => { localStorage.removeItem("userEmail"); router.push("/"); }} className="flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        {/* Top Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto mb-8 pb-2 border-b border-slate-200">
          <button onClick={() => setActiveTab("pending")} className={`px-4 md:px-6 py-3 rounded-t-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === "pending" ? "bg-white text-blue-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-200/50"}`}>
            <ShieldCheck className="w-5 h-5" /> Pending ({applications.length})
          </button>
          <button onClick={() => setActiveTab("residents")} className={`px-4 md:px-6 py-3 rounded-t-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === "residents" ? "bg-white text-blue-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-200/50"}`}>
            <UserCheck className="w-5 h-5" /> Manage Residents ({residents.length})
          </button>
          <button onClick={() => setActiveTab("manual")} className={`px-4 md:px-6 py-3 rounded-t-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === "manual" ? "bg-white text-blue-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-200/50"}`}>
            <UserPlus className="w-5 h-5" /> Add Offline
          </button>
          <button onClick={() => setActiveTab("admins")} className={`px-4 md:px-6 py-3 rounded-t-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === "admins" ? "bg-white text-blue-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-200/50"}`}>
            <Users className="w-5 h-5" /> Admins
          </button>
        </div>

        {/* TAB 1: PENDING APPROVALS */}
        {activeTab === "pending" && (
          <div>
            {applications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                <p className="text-slate-500">No pending applications at the moment.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {applications.map((app) => (
                  <div key={app.id} className="border-b border-slate-100 last:border-0">
                    <button onClick={() => setExpandedId(expandedId === app.id ? null : app.id)} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{app.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-4 mt-1">
                          <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                          <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{app.sharing_type}</span>
                        </p>
                      </div>
                      <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${expandedId === app.id ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {expandedId === app.id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-slate-50/50">
                          <div className="p-6 border-t border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                              <div className="space-y-3">
                                <p className="text-sm"><span className="text-slate-500">Email:</span> <strong className="text-slate-900">{app.email}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Phone:</span> <strong className="text-slate-900">{app.phone}</strong></p>
                              </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                              <div className="flex-1 w-full">
                                <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Assign Monthly Fee (₹)</label>
                                <input type="number" placeholder="e.g. 8500" value={fees[app.id] || ""} onChange={(e) => setFees({ ...fees, [app.id]: e.target.value })} className="w-full md:max-w-xs p-3 border border-slate-200 rounded-lg outline-none font-bold" />
                              </div>
                              <button onClick={() => handleApprove(app.id)} disabled={approvingId === app.id || !fees[app.id]} className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {approvingId === app.id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Approve & Grant Access"}
                              </button>
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

        {/* TAB 2: MANAGE RESIDENTS */}
        {activeTab === "residents" && (
          <div>
            {residents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">No active residents yet.</h3>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {residents.map((app) => (
                  <div key={app.id} className="border-b border-slate-100 last:border-0">
                    <button onClick={() => setExpandedId(expandedId === app.id ? null : app.id)} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{app.name}</h3>
                          <p className="text-sm text-slate-500">Room: <strong>{app.room || "Unassigned"}</strong></p>
                        </div>
                        {app.fee_status === 'paid' ? (
                           <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">Paid</span>
                        ) : (
                           <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">Payment Due</span>
                        )}
                      </div>
                      <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${expandedId === app.id ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {expandedId === app.id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-slate-50/50">
                          <div className="p-6 border-t border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Details</h4>
                                <p className="text-sm"><span className="text-slate-500">Email:</span> <strong className="text-slate-900">{app.email}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">DOB:</span> <strong className="text-slate-900">{app.dob || "N/A"}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Father/Mother:</span> <strong className="text-slate-900">{app.father_name || "N/A"} / {app.mother_name || "N/A"}</strong></p>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact & IDs</h4>
                                <p className="text-sm"><span className="text-slate-500">Phone:</span> <strong className="text-slate-900">{app.phone || "N/A"}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Parent Ph:</span> <strong className="text-slate-900">{app.parent_phone || "N/A"}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Aadhaar:</span> <strong className="text-slate-900">{app.aadhaar || "N/A"}</strong></p>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Logistics</h4>
                                <p className="text-sm"><span className="text-slate-500">Coaching:</span> <strong className="text-slate-900">{app.coaching || "N/A"}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Sharing:</span> <strong className="text-slate-900">{app.sharing_type || "N/A"}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Address:</span> <strong className="text-slate-900 block bg-white p-2 border rounded mt-1">{app.address || "N/A"}</strong></p>
                              </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 text-orange-500"/> Administrative Actions</h4>
                              <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Current Month Rent</p>
                                    <p className={`font-bold ${app.fee_status === 'paid' ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {app.fee_status === 'paid' ? '✓ Marked as Paid' : '⚠ Payment Due'}
                                    </p>
                                  </div>
                                  <button onClick={() => handleToggleFeeStatus(app.id, app.fee_status)} disabled={updatingId === app.id} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${app.fee_status === 'paid' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                                    {updatingId === app.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (app.fee_status === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid')}
                                  </button>
                                </div>
                                <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                                  <div className="w-full">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Adjust Monthly Fee (₹)</p>
                                    <input type="number" value={editFees[app.id] || ""} onChange={(e) => setEditFees({ ...editFees, [app.id]: e.target.value })} className="w-full p-2 border border-slate-200 rounded outline-none font-bold" />
                                  </div>
                                  <button onClick={() => handleUpdateFeeAmount(app.id)} disabled={updatingId === app.id || editFees[app.id] === app.monthly_fee} className="px-4 py-2 mt-5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap">
                                    Update Fee
                                  </button>
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

        {/* TAB 3: MANUAL OFFLINE ADD */}
        {activeTab === "manual" && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Register Resident Manually</h2>
            <p className="text-slate-500 mb-8 text-sm">Fill out the mandatory fields. Optional fields can be left entirely blank. This skips the verification queue and immediately grants them portal access.</p>
            
            <form onSubmit={handleManualAdd} className="space-y-8">
              <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800 mb-4">Mandatory Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-700">Full Name *</label><input required type="text" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-700">Email Address *</label><input required type="email" value={manualForm.email} onChange={e => setManualForm({...manualForm, email: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-700">Room Assigned *</label><input required type="text" value={manualForm.room} onChange={e => setManualForm({...manualForm, room: e.target.value})} className="w-full p-3 border rounded-lg mt-1" placeholder="e.g. 101" /></div>
                  <div><label className="text-xs font-bold text-slate-700">Monthly Fee (₹) *</label><input required type="number" value={manualForm.monthlyFee} onChange={e => setManualForm({...manualForm, monthlyFee: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div className="md:col-span-2"><label className="text-xs font-bold text-slate-700">Sharing Type *</label>
                    <select required value={manualForm.sharingType} onChange={e => setManualForm({...manualForm, sharingType: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-white">
                      <option value="Double Sharing">Double Sharing</option>
                      <option value="Single Sharing">Single Sharing</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Optional Background Data (Leave blank if unknown)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-xs font-bold text-slate-600">Phone</label><input type="tel" value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Parent Phone</label><input type="tel" value={manualForm.parentPhone} onChange={e => setManualForm({...manualForm, parentPhone: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-600">DOB</label><input type="date" value={manualForm.dob} onChange={e => setManualForm({...manualForm, dob: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Father's Name</label><input type="text" value={manualForm.fatherName} onChange={e => setManualForm({...manualForm, fatherName: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Mother's Name</label><input type="text" value={manualForm.motherName} onChange={e => setManualForm({...manualForm, motherName: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Aadhaar No.</label><input type="text" value={manualForm.aadhaar} onChange={e => setManualForm({...manualForm, aadhaar: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Coaching</label><input type="text" value={manualForm.coaching} onChange={e => setManualForm({...manualForm, coaching: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Any Disease</label><input type="text" value={manualForm.disease} onChange={e => setManualForm({...manualForm, disease: e.target.value})} className="w-full p-3 border rounded-lg mt-1" /></div>
                  <div className="md:col-span-3"><label className="text-xs font-bold text-slate-600">Permanent Address</label><textarea value={manualForm.address} onChange={e => setManualForm({...manualForm, address: e.target.value})} className="w-full p-3 border rounded-lg mt-1"></textarea></div>
                </div>
              </div>
              <button disabled={addingManual} type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 disabled:opacity-50">
                {addingManual ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Save Student to Database"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: ADMIN MANAGEMENT */}
        {activeTab === "admins" && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Manage System Admins</h2>
            <form onSubmit={handleAddAdmin} className="flex gap-4 mb-8">
              <input required type="email" placeholder="New admin email..." value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600" />
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700">Add Admin</button>
            </form>
            <div className="space-y-3">
              {adminList.map((admin) => (
                <div key={admin.id} className="flex justify-between items-center p-4 border rounded-xl bg-slate-50">
                  <span className="font-medium text-slate-900">{admin.email}</span>
                  <button onClick={() => handleRemoveAdmin(admin.email)} className="text-red-500 hover:text-red-700 text-sm font-bold">Revoke Access</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}