"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, LogOut, User, Home, Wallet, Calendar, Shield, MessageSquareWarning, UploadCloud, CheckCircle, Coffee, PhoneCall, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

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
    if (!concernText.trim()) {
      alert("Please describe your issue before submitting.");
      return;
    }
    
    setSubmittingConcern(true);
    
    try {
      const res = await fetch("/api/student/concern", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: student.name, 
          studentEmail: student.email, 
          room: student.room,
          issue: concernText, 
          fileBase64: concernFile?.base64, 
          fileName: concernFile?.name
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setConcernSuccess(true);
        setTimeout(() => { 
          setIsConcernModalOpen(false); 
          setConcernSuccess(false); 
          setConcernText(""); 
          setConcernFile(null); 
        }, 2500);
      } else {
        alert("Failed to submit: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Network error. Please try again.");
    } finally {
      setSubmittingConcern(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (error || !student) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-6 text-center">
      <Shield className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
      <button onClick={handleLogout} className="bg-white text-black font-bold py-3 px-8 rounded-xl mt-6 hover:bg-gray-200">Return to Login</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f5] pb-20 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ✨ Aesthetic Hero Header */}
      <div className="relative overflow-hidden bg-[#0a0a0a] text-white px-6 py-16 md:px-12 shadow-2xl rounded-b-[3rem] mb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Resident Portal Active
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black tracking-tight mb-2">
              Hello, {student.name.split(" ")[0]}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-400 font-medium">
              Manage your stay, track payments, and access PG amenities.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex gap-4">
            <button onClick={() => setIsConcernModalOpen(true)} className="flex items-center gap-2 font-bold bg-white text-black px-6 py-3 rounded-2xl hover:bg-gray-100 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
              <MessageSquareWarning className="w-5 h-5" /> Raise Concern
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 font-bold bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl transition-all border border-white/10 text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* 💳 Top Section: Digital ID & Quick Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* DIGITAL RESIDENT ID CARD */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1 h-full">
            <div className="relative h-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 to-black p-1 shadow-2xl">
              <div className="relative h-full bg-white/5 backdrop-blur-3xl rounded-[1.8rem] p-8 flex flex-col justify-between border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/50 text-[10px] font-mono tracking-widest uppercase mb-1">Resident Pass</p>
                    <p className="text-white font-bold tracking-widest">LAKSHYA PG</p>
                  </div>
                  <QrCode className="w-10 h-10 text-white/30" />
                </div>
                
                <div className="mt-12 mb-8">
                  <h2 className="text-3xl font-black text-white leading-tight">{student.name}</h2>
                  <p className="text-blue-400 font-mono text-sm mt-2 truncate">{student.email}</p>
                </div>
                
                <div className="flex justify-between items-end pb-2">
                  <div>
                    <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase mb-1">Assigned Room</p>
                    <p className="text-white font-black text-3xl">{student.room || "TBA"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase mb-1">Access</p>
                    <p className="text-emerald-400 font-bold text-sm tracking-wider uppercase">Granted</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Payments & Amenities */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Rent Card with Clear Advance Paid-Till Date */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${student.fee_status === 'paid' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                  <Wallet className="w-6 h-6 text-slate-800" />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Rent (Advance)</p>
                <h3 className="text-4xl font-black text-slate-900 mt-2">₹{student.monthly_fee || "N/A"}</h3>
              </div>
              <div className="mt-6">
                <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${student.fee_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {student.fee_status === 'paid' ? `✨ Paid till ${student.paid_till || 'Next Cycle'}` : '⚠️ Advance Payment Due'}
                </span>
              </div>
            </motion.div>

            {/* Quick Amenities Grid (Wi-Fi Removed) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col gap-4 justify-center">
              
              {/* MEALS */}
              <div className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-100 shadow-sm">
                <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><Coffee className="w-5 h-5"/></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase">Meals & Dining</p><p className="font-bold text-slate-900 text-sm">Breakfast: 8 AM • Dinner: 8 PM</p></div>
              </div>

              {/* WARDEN */}
              <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><PhoneCall className="w-5 h-5"/></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Warden</p><p className="font-bold text-slate-900 text-sm">Front Desk</p></div>
                </div>
                <a href="tel:+919876543210" className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors">Call Now</a>
              </div>

            </motion.div>
          </div>
        </div>

        {/* 📄 Bottom Section: Profile Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><User className="w-5 h-5"/></div>
            <h2 className="text-xl font-bold text-slate-900">Personal File</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Phone Number</span><span className="font-medium text-slate-900">{student.phone || "—"}</span></div>
            <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Parent's Phone</span><span className="font-medium text-slate-900">{student.parent_phone || "—"}</span></div>
            <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Date of Birth</span><span className="font-medium text-slate-900">{student.dob || "—"}</span></div>
            <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Gov ID</span><span className="font-medium text-slate-900">{student.aadhaar || "—"}</span></div>
            <div className="md:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Permanent Address</span><span className="font-medium text-slate-900">{student.address || "—"}</span></div>
          </div>
        </motion.div>
      </div>

      {/* 🛑 AESTHETIC RAISE CONCERN MODAL */}
      <AnimatePresence>
        {isConcernModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#0a0a0a]/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
              {concernSuccess ? (
                <div className="p-16 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Issue Submitted</h2>
                  <p className="text-slate-500">All admins have been notified and will reach out to you shortly.</p>
                </div>
              ) : (
                <div className="p-10">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500"><MessageSquareWarning className="w-6 h-6"/></div>
                      <h2 className="text-2xl font-black text-slate-900">Raise Concern</h2>
                    </div>
                    <button onClick={() => setIsConcernModalOpen(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-colors">&times;</button>
                  </div>
                  
                  <textarea rows={4} placeholder="Describe your issue clearly so we can help..." value={concernText} onChange={(e) => setConcernText(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none mb-4 text-slate-900 placeholder:text-slate-400"></textarea>
                  
                  <div className="mb-10">
                    <label className="flex items-center gap-3 p-5 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group">
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform"><UploadCloud className="w-5 h-5 text-blue-600" /></div>
                      <span className="text-sm font-bold text-slate-600 flex-1 truncate">
                        {concernFile ? concernFile.name : "Attach Photo or Document"}
                      </span>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setIsConcernModalOpen(false)} className="px-6 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
                    <button onClick={submitConcern} disabled={submittingConcern} className="flex-1 py-4 font-bold text-white bg-slate-900 rounded-2xl hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center shadow-lg shadow-black/20">
                      {submittingConcern ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit to Admin"}
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