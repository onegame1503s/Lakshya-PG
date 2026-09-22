"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", dob: "", fatherName: "", motherName: "",
    phone: "", parentPhone: "", aadhaar: "", coaching: "", address: "", disease: ""
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", ...formData }), // Sends everything to your API
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", email: formData.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-slate-900 text-white p-10 text-center">
          <h1 className="text-4xl font-bold mb-2">LAKSHYA PG</h1>
          <p className="text-slate-400">Official Admission Application & Agreement</p>
        </div>

        <div className="p-10">
          {error && <div className="mb-6 bg-red-50 text-red-600 text-sm p-4 rounded-xl font-medium border border-red-100 text-center">{error}</div>}

          {step === "success" ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Submitted</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Your email has been verified and your form is securely submitted. The admin will review your details and approve your portal access.</p>
              <Link href="/" className="inline-block bg-slate-900 text-white font-bold py-4 px-10 rounded-xl hover:bg-slate-800 transition-colors">
                Return to Homepage
              </Link>
            </div>
          ) : step === "otp" ? (
            <form onSubmit={handleVerifyOtp} className="max-w-md mx-auto py-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
                <p className="text-slate-500 text-sm">We sent a 6-digit code to <span className="font-semibold text-slate-900">{formData.email}</span></p>
              </div>
              <div className="space-y-6">
                <input 
                  type="text" required maxLength={6} 
                  value={otp} onChange={e => setOtp(e.target.value)}
                  className="w-full p-4 border rounded-xl text-2xl tracking-[1em] text-center font-mono font-bold focus:ring-2 focus:ring-blue-600 outline-none" 
                  placeholder="------" 
                />
                <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Submit Application"}
                </button>
                <button type="button" onClick={() => setStep("form")} className="w-full text-slate-500 text-sm hover:text-slate-900 underline">
                  Wait, let me fix my details
                </button>
              </div>
            </form>
          ) : (
            <>
              <form id="application-form" onSubmit={handleSendOtp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Applicant Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@example.com" className="w-full p-3 border rounded-xl" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                  <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Father's Name</label>
                  <input type="text" required value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Mother's Name</label>
                  <input type="text" required value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Applicant Ph. No.</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Parents Ph. No.</label>
                  <input type="tel" required value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Aadhaar Number</label>
                  <input type="text" required value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Coaching Name</label>
                  <input type="text" required value={formData.coaching} onChange={e => setFormData({...formData, coaching: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Permanent Address</label>
                  <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 border rounded-xl"></textarea>
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Any Disease (If yes, mention. If no, type 'None')</label>
                  <input type="text" required value={formData.disease} onChange={e => setFormData({...formData, disease: e.target.value})} placeholder="e.g. None" className="w-full p-3 border rounded-xl" />
                </div>
              </form>

              <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Rules & Regulations</h3>
                <ul className="space-y-3 text-slate-600 text-sm list-decimal list-inside">
                  <li>A deposit of Rs. 5000 has to be deposited along with the fees.</li>
                  <li>Every month the rent must be disbursed within 5 days from your admission date.</li>
                  <li>Smoking and drinking is strictly not allowed.</li>
                  <li>Wastage of food is strictly not allowed.</li>
                  <li>Tea, lunch, breakfast, and dinner will be allowed in fixed hours only.</li>
                  <li>Students are not allowed to take any outsider to their room.</li>
                  <li>If students damage PG property, the money will be deducted from their deposit.</li>
                  <li>If there will be a power outage (tampering), a fine of Rs 100 will be imposed.</li>
                  <li className="font-bold text-red-600">If the student leaves PG before 9 months, the security will not be refunded.</li>
                </ul>
              </div>

              <button disabled={loading} type="submit" form="application-form" className="w-full mt-10 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Accept Terms & Submit Application"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}