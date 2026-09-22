"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, CheckCircle, User, Phone, MapPin, FileText, Calendar, ShieldCheck, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fees, setFees] = useState<Record<string, string>>({});
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/admin/applications");
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const fee = fees[id];
    if (!fee) return alert("Please enter a monthly fee for this student.");

    setApprovingId(id);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, monthlyFee: fee }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Remove the approved student from the pending list UI
        setApplications(apps => apps.filter(app => app.id !== id));
        setExpandedId(null);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setApprovingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white px-6 py-8 md:px-12 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Lakshya PG Management System</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Pending Approvals ({applications.length})</h2>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500">There are no pending student applications at the moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {applications.map((app) => (
              <div key={app.id} className="border-b border-slate-100 last:border-0">
                {/* Header (Click to expand) */}
                <button 
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{app.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-4 mt-1">
                      <span>Room: <strong className="text-slate-700">{app.room}</strong></span>
                      <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <motion.div animate={{ rotate: expandedId === app.id ? 180 : 0 }}>
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  </motion.div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === app.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-slate-50/50"
                    >
                      <div className="p-6 border-t border-slate-100">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                          {/* Personal Info */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><User className="w-3 h-3"/> Personal Details</h4>
                            <p className="text-sm"><span className="text-slate-500">Email:</span> <strong className="text-slate-900">{app.email}</strong></p>
                            <p className="text-sm"><span className="text-slate-500">DOB:</span> <strong className="text-slate-900">{app.dob}</strong></p>
                            <p className="text-sm"><span className="text-slate-500">Father:</span> <strong className="text-slate-900">{app.father_name}</strong></p>
                            <p className="text-sm"><span className="text-slate-500">Mother:</span> <strong className="text-slate-900">{app.mother_name}</strong></p>
                            <p className="text-sm"><span className="text-slate-500">Disease:</span> <strong className="text-slate-900">{app.disease}</strong></p>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3"/> Contact & IDs</h4>
                            <p className="text-sm"><span className="text-slate-500">Phone:</span> <strong className="text-slate-900">{app.phone}</strong></p>
                            <p className="text-sm"><span className="text-slate-500">Parent Ph:</span> <strong className="text-slate-900">{app.parent_phone}</strong></p>
                            <p className="text-sm"><span className="text-slate-500">Aadhaar:</span> <strong className="text-slate-900">{app.aadhaar}</strong></p>
                            <p className="text-sm"><span className="text-slate-500">Coaching:</span> <strong className="text-slate-900">{app.coaching}</strong></p>
                          </div>

                          {/* Logistics Info */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> Timeline</h4>
                            <p className="text-sm"><span className="text-slate-500">Admission Date:</span> <strong className="text-slate-900">{app.admission_date}</strong></p>
                            <p className="text-sm"><span className="text-slate-500">Deposit Date:</span> <strong className="text-slate-900">{app.deposit_eligibility_date}</strong></p>
                            <div className="mt-2 text-sm">
                              <span className="text-slate-500 block mb-1">Permanent Address:</span> 
                              <p className="text-slate-900 bg-white p-2 rounded-lg border border-slate-200">{app.address}</p>
                            </div>
                          </div>
                        </div>

                        {/* Approval Action Bar */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                          <div className="flex-1 w-full">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Assign Monthly Fee (₹)</label>
                            <input 
                              type="number" 
                              placeholder="e.g. 8500" 
                              value={fees[app.id] || ""}
                              onChange={(e) => setFees({ ...fees, [app.id]: e.target.value })}
                              className="w-full md:max-w-xs p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 font-bold"
                            />
                          </div>
                          <button 
                            onClick={() => handleApprove(app.id)}
                            disabled={approvingId === app.id || !fees[app.id]}
                            className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {approvingId === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Approve & Grant Portal Access <CheckCircle className="w-5 h-5" /></>}
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
    </div>
  );
}