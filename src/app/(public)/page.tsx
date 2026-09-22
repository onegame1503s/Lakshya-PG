"use client";

import Hero from "@/components/public/Hero";
import EditorialFacilities from "@/components/public/EditorialFacilities";
import Link from "next/link";
import { motion } from "framer-motion";

const REVIEWS = [
  { name: "Kalyani Bharti", text: "I had an excellent stay at Laksh Pg! The rooms are very spacious... booking was fast and easy, and the location is great. Highly recommend!", initials: "KB" },
  { name: "Rajat Mehra", text: "Best PG in Haldwani for students. The local library is just 5 mins away, and the environment is dead silent at night. Food is actually good and served strictly on time.", initials: "RM" },
  { name: "Simran Kaur", text: "Felt very safe here. The biometric entry and CCTV gave my parents peace of mind. The single room configuration is perfect for uninterrupted focus.", initials: "SK" },
  { name: "Amit Joshi", text: "Perfect location. Gym, medical stores, and barber are literally walking distance. The power backup saved me during summer outages.", initials: "AJ" },
  { name: "Priya Negi", text: "Super clean and well-maintained. The owner is strict about property rules which is great because it keeps the place quiet for serious studying.", initials: "PN" }
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F8]">
      <Hero />

      {/* Verified Reviews & Location Link Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full flex flex-col items-center">
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-8 border-b border-zinc-200 pb-4 text-center w-full">
          Verified Resident Feedback
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`p-6 rounded-2xl ${index === 0 ? 'bg-zinc-950 text-white lg:col-span-2' : 'bg-white border border-zinc-100 shadow-sm text-zinc-950'}`}
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-3 h-3 ${index === 0 ? 'text-white' : 'text-zinc-950'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <p className={`text-sm font-light leading-relaxed mb-6 ${index === 0 ? 'text-zinc-300' : 'text-zinc-600'}`}>
                "{review.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                  {review.initials}
                </div>
                <span className="block text-xs font-bold tracking-wide">{review.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* New Location Routing Button */}
        <Link href="/locality">
          <button className="bg-transparent border border-zinc-300 text-zinc-950 px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-zinc-950 hover:text-white transition-colors duration-500">
            Explore Location & Infrastructure
          </button>
        </Link>
      </section>

      <EditorialFacilities />

      <section className="py-32 md:py-48 bg-zinc-950 text-white selection:bg-white selection:text-zinc-950">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-8">
            02 // Availability
          </span>
          <h2 className="text-4xl md:text-7xl font-light tracking-tighter mb-8 leading-tight">
            Ready to secure <br className="hidden md:block" /> your space?
          </h2>
          <p className="text-lg text-zinc-400 mb-12 max-w-xl mx-auto font-light leading-relaxed">
            View our room configurations, current occupancy status, and monthly fee structures. Due to high demand and strict capacity limits, pricing is unlocked via secure request.
          </p>
          <Link href="/rooms">
            <button className="bg-white text-zinc-950 px-12 py-5 font-medium text-sm tracking-wide uppercase hover:bg-zinc-200 transition-colors duration-500">
              Unlock Room Rates & Availability
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}