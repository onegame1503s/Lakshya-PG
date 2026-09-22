"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/student-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_otp", email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/student-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", email, otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Invalid code");

      // Save the email so the dashboards know who is logged in
      localStorage.setItem("userEmail", email);
      
      // SMART ROUTING: Admin goes to /admin, Student goes to /student/dashboard
      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/student/dashboard");
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8] text-zinc-950 flex items-center justify-center px-6 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm"
      >
        <div className="mb-8">
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-2 block">
            Portal // Free Secure Login
          </span>
          <h1 className="text-3xl font-light tracking-tight text-zinc-950">
            Secure <span className="text-zinc-400">Access.</span>
          </h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase block mb-2">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="name@example.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full bg-zinc-950 text-white rounded-xl py-4 text-xs font-bold tracking-[0.1em] uppercase hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Login Code <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Enter 6-Digit OTP</label>
                <button type="button" onClick={() => setStep("email")} className="text-xs text-zinc-400 hover:text-zinc-950 underline">Change Email</button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                  maxLength={6}
                  placeholder="123456"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Code sent to your Brevo inbox. Valid for 10 mins.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full bg-zinc-950 text-white rounded-xl py-4 text-xs font-bold tracking-[0.1em] uppercase hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Enter Portal <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}