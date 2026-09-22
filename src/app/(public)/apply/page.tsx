"use client";

import { motion } from "framer-motion";

export default function ApplyPage() {
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
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Applicant Name</label><input type="text" className="w-full p-3 border rounded-xl" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Date of Birth</label><input type="date" className="w-full p-3 border rounded-xl" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Father's Name</label><input type="text" className="w-full p-3 border rounded-xl" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Mother's Name</label><input type="text" className="w-full p-3 border rounded-xl" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Applicant Ph. No.</label><input type="tel" className="w-full p-3 border rounded-xl" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Parents Ph. No.</label><input type="tel" className="w-full p-3 border rounded-xl" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Aadhaar Number</label><input type="text" className="w-full p-3 border rounded-xl" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Coaching Name</label><input type="text" className="w-full p-3 border rounded-xl" /></div>
            <div className="col-span-1 md:col-span-2 space-y-2"><label className="text-sm font-semibold text-slate-700">Permanent Address</label><textarea className="w-full p-3 border rounded-xl"></textarea></div>
            <div className="col-span-1 md:col-span-2 space-y-2"><label className="text-sm font-semibold text-slate-700">Any Disease (If yes, mention)</label><input type="text" className="w-full p-3 border rounded-xl" /></div>
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

          <button className="w-full mt-10 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">
            Accept Terms & Submit Application
          </button>
        </div>
      </motion.div>
    </div>
  );
}