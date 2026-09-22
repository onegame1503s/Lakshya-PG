"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, CheckCircle, User, Phone, MapPin, FileText, Calendar, ShieldCheck, LogOut, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"pending" | "manual" | "admins">("pending");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Pendings State
  const [applications, setApplications] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fees, setFees] = useState<Record<string, string>>({});
  const [approvingId, setApprovingId] = useState<string | null>(null);

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

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Pendings (Now correctly pointing to /api/admins)
      const appRes = await fetch(`/api/admins/applications?t=${Date.now()}`);
      const appData = await appRes.json();
      if (appData.success) setApplications(appData.applications);

      // 2. Fetch Admins
      const admRes = await fetch(`/api/admins?t=${Date.now()}`);
      const admData = await admRes.json();
      if (Array.isArray(admData)) setAdminList(admData);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* --- PENDING ACTIONS --- */
  const handleApprove = async (id: string) => {
    const fee = fees[id];
    if (!fee) return alert("Please enter a monthly fee for this student.");
    setApprovingId(id);
    try {
      // Correctly pointing to /api/admins
      const res = await fetch("/api/admins/applications", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, monthlyFee: fee }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications(apps => apps.filter(app => app.id !== id));
        setExpandedId(null);
      } else alert(data.error);
    } finally {
      setApprovingId(null);
    }
  };

  /* --- MANUAL ADD ACTIONS --- */
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingManual(true);
    try {
      // Correctly pointing to /api/admins
      const res = await fetch("/api/admins/manual-add", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(manualForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("Student added successfully and granted portal access!");
        setManualForm({ name: "", email: "", room: "", monthlyFee: "", sharingType: "Double Sharing", dob: "", fatherName: "", motherName: "", phone: "", parentPhone: "", aadhaar: "", coaching: "", address: "", disease: "" });
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
          <button onClick={() => setActiveTab("pending")} className={`px-6 py-3 rounded-t-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === "pending" ? "bg-white text-blue-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-200/50"}`}>
            <ShieldCheck className="w-5 h-5" /> Pending Approvals ({applications.length})
          </button>
          <button onClick={() => setActiveTab("manual")} className={`px-6 py-3 rounded-t-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === "manual" ? "bg-white text-blue-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-200/50"}`}>
            <UserPlus className="w-5 h-5" /> Add Resident (Offline)
          </button>
          <button onClick={() => setActiveTab("admins")} className={`px-6 py-3 rounded-t-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === "admins" ? "bg-white text-blue-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-200/50"}`}>
            <Users className="w-5 h-5" /> Manage Admins
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
                <p className="text-xs text-slate-400 mt-2">(Note: Students must verify their email with the OTP to appear here).</p>
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
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Details</h4>
                                <p className="text-sm"><span className="text-slate-500">Email:</span> <strong className="text-slate-900">{app.email}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">DOB:</span> <strong className="text-slate-900">{app.dob}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Father/Mother:</span> <strong className="text-slate-900">{app.father_name} / {app.mother_name}</strong></p>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact & IDs</h4>
                                <p className="text-sm"><span className="text-slate-500">Phone:</span> <strong className="text-slate-900">{app.phone}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Parent Ph:</span> <strong className="text-slate-900">{app.parent_phone}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Aadhaar:</span> <strong className="text-slate-900">{app.aadhaar}</strong></p>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Logistics</h4>
                                <p className="text-sm"><span className="text-slate-500">Coaching:</span> <strong className="text-slate-900">{app.coaching}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Disease:</span> <strong className="text-slate-900">{app.disease}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Address:</span> <strong className="text-slate-900 block bg-white p-2 border rounded mt-1">{app.address}</strong></p>
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

        {/* TAB 2: MANUAL OFFLINE ADD */}
        {activeTab === "manual" && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Register Resident Manually</h2>
            <p className="text-slate-500 mb-8 text-sm">Fill out the mandatory fields. Optional fields can be left entirely blank. This skips the verification queue and immediately grants them portal access.</p>
            
            <form onSubmit={handleManualAdd} className="space-y-8">
              {/* Mandatory Section */}
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

              {/* Optional Section */}
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

        {/* TAB 3: ADMIN MANAGEMENT */}
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