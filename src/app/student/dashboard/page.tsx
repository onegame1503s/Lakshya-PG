"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LogOut, User, Home, Wallet, Calendar, AlertCircle, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const email = localStorage.getItem("userEmail");
      
      if (!email) {
        router.push("/student/login");
        return;
      }

      try {
        const res = await fetch("/api/student/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        
        const data = await res.json();
        
        if (data.success) {
          setStudent(data.student);
        } else {
          setError(data.error);
        }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (error || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-8">{error || "Your account has not been approved yet."}</p>
        <button onClick={handleLogout} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800">Return to Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Student Header */}
      <div className="bg-slate-900 text-white px-6 py-8 md:px-12 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resident Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, {student.name.split(" ")[0]}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10">
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-xl text-blue-600"><Home className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Assigned</p>
              <h3 className="text-2xl font-black text-slate-900">{student.room || "Pending"}</h3>
              <p className="text-xs text-slate-500 font-medium">{student.sharing_type}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600"><Wallet className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Fee</p>
              <h3 className="text-2xl font-black text-slate-900">₹{student.monthly_fee || "Pending"}</h3>
              <p className="text-xs text-slate-500 font-medium">+ ₹5000 Deposit</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-xl text-orange-600"><Calendar className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rent Due Date</p>
              <h3 className="text-lg font-black text-slate-900 leading-tight">Within 5 Days<br/>of Admission</h3>
              <p className="text-xs text-slate-500 font-medium">Admission: {student.admission_date || "N/A"}</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><User className="w-5 h-5 text-blue-600"/> Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                <div><span className="text-xs font-bold text-slate-400 uppercase block">Full Name</span><span className="font-semibold text-slate-900">{student.name}</span></div>
                <div><span className="text-xs font-bold text-slate-400 uppercase block">Email Address</span><span className="font-semibold text-slate-900">{student.email}</span></div>
                <div><span className="text-xs font-bold text-slate-400 uppercase block">Phone Number</span><span className="font-semibold text-slate-900">{student.phone || "Not Provided"}</span></div>
                <div><span className="text-xs font-bold text-slate-400 uppercase block">Parent's Phone</span><span className="font-semibold text-slate-900">{student.parent_phone || "Not Provided"}</span></div>
                <div><span className="text-xs font-bold text-slate-400 uppercase block">Date of Birth</span><span className="font-semibold text-slate-900">{student.dob || "Not Provided"}</span></div>
                <div><span className="text-xs font-bold text-slate-400 uppercase block">Aadhaar No.</span><span className="font-semibold text-slate-900">{student.aadhaar || "Not Provided"}</span></div>
                <div className="md:col-span-2"><span className="text-xs font-bold text-slate-400 uppercase block">Permanent Address</span><span className="font-semibold text-slate-900">{student.address || "Not Provided"}</span></div>
              </div>
            </div>
          </div>

          {/* Rules Widget */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 p-8 rounded-2xl shadow-sm text-slate-300">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400"/> Resident Rules</h2>
              <ul className="space-y-4 text-sm list-disc list-inside">
                <li><strong className="text-white">Deposit:</strong> Rs. 5000 is required alongside the first month's fee.</li>
                <li><strong className="text-white">Rent Timing:</strong> Must be disbursed within 5 days from your admission date every month.</li>
                <li><strong className="text-white">Strictly Prohibited:</strong> Smoking, drinking, and food wastage.</li>
                <li><strong className="text-white">Meals:</strong> Tea, lunch, breakfast, and dinner allowed in fixed hours only.</li>
                <li><strong className="text-white">Guests:</strong> Outsiders are not allowed in rooms.</li>
                <li><strong className="text-white">Fines:</strong> Damage to property will be deducted from deposit. Power tampering fine is Rs 100.</li>
                <li className="font-bold text-red-400 list-none mt-6 bg-red-950/50 p-4 rounded-lg border border-red-900">
                  Notice: If the student leaves PG before 9 months, the security deposit will not be refunded.
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}