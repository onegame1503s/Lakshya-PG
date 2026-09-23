"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, LogOut, User, Home, Wallet, Calendar, AlertCircle, Shield, MessageSquareWarning, UploadCloud, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Concern Modal State
  const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);
  const [concernText, setConcernText] = useState("");
  const [concernFile, setConcernFile] = useState<{ base64: string, name: string } | null>(null);
  const [submittingConcern, setSubmittingConcern] = useState(false);
  const [concernSuccess, setConcernSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return router.push("/student/login");
      try {
        // FIXED THIS LINE: Changed from "/api/student/profile" to "/student/profile"
        const res = await fetch("/student/profile", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.success) setStudent(data.student);
        else setError(data.error);
      } catch (err: any) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  // --- CONCERN LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("File must be less than 2MB");

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setConcernFile({ base64: event.target.result as string, name: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  const submitConcern = async () => {
    if (!concernText.trim()) return alert("Please type your concern.");
    setSubmittingConcern(true);
    try {
      const res = await fetch("/api/student/concern", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: student.name, studentEmail: student.email, room: student.room,
          issue: concernText, fileBase64: concernFile?.base64, fileName: concernFile?.name
        }),
      });
      if (res.ok) {
        setConcernSuccess(true);
        setTimeout(() => { setIsConcernModalOpen(false); setConcernSuccess(false); setConcernText(""); setConcernFile(null); }, 2000);
      }
    } finally {
      setSubmittingConcern(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (error || !student) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
      <p className="text-slate-500 mb-8">{error || "Your account has not been approved yet."}</p>
      <button onClick={handleLogout} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800">Return to Login</button>
    </div>
  );

  // Generate dynamic chart data based on their actual fee
  const feeNumber = parseInt(student.monthly_fee) || 8500;
  const chartData = [
    { month: "Jan", paid: feeNumber }, { month: "Feb", paid: feeNumber }, 
    { month: "Mar", paid: feeNumber }, { month: "Apr", paid: feeNumber },
    { month: "May", paid: student.fee_status === 'paid' ? feeNumber : 0 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
      
      {/* 🌟 Premium Hero Header */}
      <div className="relative overflow-hidden bg-slate-900 text-white px-6 py-12 md:px-12 shadow-2xl rounded-b-[2.5rem] mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-900 opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black tracking-tight mb-2">
              Welcome back, {student.name.split(" ")[0]}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-blue-200 font-medium">
              Lakshya PG Resident Portal
            </motion.p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsConcernModalOpen(true)} className="flex items-center gap-2 font-bold bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-500/30">
              <MessageSquareWarning className="w-5 h-5" /> Raise Concern
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 font-bold bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl transition-all backdrop-blur-md border border-white/10">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* 📊 Premium Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-xl"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-600/30"><Home className="w-7 h-7" /></div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Room</p>
                <h3 className="text-3xl font-black text-slate-900">{student.room || "Pending"}</h3>
                <p className="text-xs font-bold text-blue-600 mt-1">{student.sharing_type}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
             <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full blur-xl"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-4 mb-4">
                 <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-500/30"><Wallet className="w-7 h-7" /></div>
                 <div>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Rent</p>
                   <h3 className="text-3xl font-black text-slate-900">₹{student.monthly_fee || "N/A"}</h3>
                 </div>
               </div>
               <div className={`py-2 px-4 rounded-xl text-center font-bold text-sm ${student.fee_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                 {student.fee_status === 'paid' ? '✨ RENT PAID THIS MONTH' : '⚠️ PAYMENT DUE'}
               </div>
             </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full blur-xl"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-orange-500 p-4 rounded-2xl text-white shadow-lg shadow-orange-500/30"><Calendar className="w-7 h-7" /></div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Next Due Date</p>
                <h3 className="text-3xl font-black text-slate-900">{student.rent_due_day ? `${student.rent_due_day}th` : '5th'}</h3>
                <p className="text-xs font-bold text-orange-600 mt-1">of every month</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Beautiful Chart */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Payment History Overview</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="paid" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorPaid)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Profile Information Grid */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
              <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2"><User className="w-6 h-6 text-blue-600"/> Personal Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                <div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</span><span className="text-lg font-bold text-slate-900">{student.name}</span></div>
                <div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Email Address</span><span className="text-lg font-bold text-slate-900">{student.email}</span></div>
                <div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Phone Number</span><span className="text-lg font-bold text-slate-900">{student.phone || "—"}</span></div>
                <div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Parent's Phone</span><span className="text-lg font-bold text-slate-900">{student.parent_phone || "—"}</span></div>
                <div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Date of Birth</span><span className="text-lg font-bold text-slate-900">{student.dob || "—"}</span></div>
                <div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Aadhaar No.</span><span className="text-lg font-bold text-slate-900">{student.aadhaar || "—"}</span></div>
                <div className="md:col-span-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Permanent Address</span><span className="text-lg font-bold text-slate-900">{student.address || "—"}</span></div>
              </div>
            </motion.div>
          </div>

          {/* Right Column (Rules) */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-slate-900 p-8 rounded-3xl shadow-xl text-slate-300 relative overflow-hidden h-full">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2 relative z-10"><Shield className="w-6 h-6 text-blue-400"/> Resident Rules</h2>
              <ul className="space-y-6 text-sm relative z-10">
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div><p><strong className="text-white block mb-1">Deposit Required</strong>Rs. 5000 is required alongside the first month's fee.</p></li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div><p><strong className="text-white block mb-1">Rent Timing</strong>Must be disbursed by the {student.rent_due_day ? `${student.rent_due_day}th` : '5th'} of every month.</p></li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div><p><strong className="text-white block mb-1">Strictly Prohibited</strong>Smoking, drinking, and food wastage.</p></li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div><p><strong className="text-white block mb-1">Guests & Visitors</strong>Outsiders are not allowed in rooms.</p></li>
                <li className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200">
                  <strong className="text-red-400 block mb-1">Important Notice</strong>If you leave the PG before 9 months, the security deposit will not be refunded.
                </li>
              </ul>
            </motion.div>
          </div>

        </div>
      </div>

      {/* 🛑 RAISE CONCERN MODAL */}
      <AnimatePresence>
        {isConcernModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
              {concernSuccess ? (
                <div className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Issue Reported</h2>
                  <p className="text-slate-500">The administration has been notified via email and will review your concern shortly.</p>
                </div>
              ) : (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">Raise a Concern</h2>
                    <button onClick={() => setIsConcernModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">Describe your issue below. All admins will be notified immediately via email.</p>
                  
                  <textarea rows={5} placeholder="Describe the issue in detail..." value={concernText} onChange={(e) => setConcernText(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 resize-none mb-4 text-slate-900"></textarea>
                  
                  <div className="mb-8">
                    <label className="flex items-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <UploadCloud className="w-6 h-6 text-blue-600" />
                      <span className="text-sm font-medium text-slate-600 flex-1 truncate">
                        {concernFile ? concernFile.name : "Attach Image / Document (Optional)"}
                      </span>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <p className="text-xs text-slate-400 mt-2 text-center">Max file size: 2MB</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setIsConcernModalOpen(false)} className="flex-1 py-4 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                    <button onClick={submitConcern} disabled={submittingConcern} className="flex-1 py-4 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center">
                      {submittingConcern ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Concern"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}