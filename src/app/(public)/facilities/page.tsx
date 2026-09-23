"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const CORE_FACILITIES = [
  {
    id: "01",
    title: "Nutritional Infrastructure",
    specs: "FIXED HOURS // HYGIENIC PREPARATION",
    description: "Time is a student's most valuable asset. Our dedicated dining facilities operate with absolute punctuality, ensuring your study routine remains uninterrupted.",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2070&auto=format&fit=crop", 
  },
  {
    id: "02",
    title: "Security",
    specs: "24/7 CCTV // ZERO OUTSIDERS",
    description: "The perimeter is entirely secured. Round-the-clock surveillance guarantees a sterile, distraction-free environment. No outsiders are permitted under any circumstances.",
    image: "https://images.unsplash.com/photo-1549109926-58f039549485?q=80&w=2070&auto=format&fit=crop", 
  },
  {
    id: "03",
    title: "Continuous Power",
    specs: "100% BACKUP // SURGE PROTECTION",
    description: "Your preparation cannot afford downtime. Our industrial-grade power backup systems ensure seamless transition during grid outages to protect your study flow.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop", 
  }
];

const AMENITIES = [
  {
    id: "fridge",
    title: "Shared Refrigerator",
    specs: "CLIMATE CONTROLLED",
    description: "Spacious, consistently maintained cold storage for personal beverages, perishables, and study snacks.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full max-w-[300px]">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M5 10h14" />
        <path d="M9 14v2" />
        <path d="M9 5v2" />
      </svg>
    )
  },
  {
    id: "wifi",
    title: "Wi-Fi",
    specs: "ZERO LATENCY ROUTING",
    description: "Enterprise-grade wireless network ensuring seamless connectivity for heavy study sessions and video lectures.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full max-w-[300px]">
        <path d="M5 12.55a11 11 0 0114.08 0" />
        <path d="M1.42 9a16 16 0 0121.16 0" />
        <path d="M8.53 16.11a6 6 0 016.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    )
  },
  {
    id: "water",
    title: "RO Water Dispenser",
    specs: "24/7 CHILLED ACCESS",
    description: "Multi-stage purified, chilled drinking water available on-demand to keep you hydrated and focused round the clock.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full max-w-[300px]">
        <path d="M6 3h12v9H6z" />
        <path d="M5 12h14v10H5z" />
        <path d="M9 16v2" />
        <path d="M15 16v2" />
        <circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="15" cy="18" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    )
  }
];

const easeCurve = [0.22, 1, 0.36, 1] as const;

const FacilityBlock = ({ facility, index }: { facility: any; index: number }) => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.15, 0.95]);
  const isEven = index % 2 === 0;

  return (
    <div ref={containerRef} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24 min-h-[70vh] mb-32 md:mb-48`}>
      <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-[3/4] relative overflow-hidden bg-zinc-200 shadow-2xl shadow-zinc-300/50">
        <motion.div style={{ scale: imageScale }} className="w-full h-full relative">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${facility.image}')` }}
          />
        </motion.div>
        {/* Removed negative margins from viewport to fix Android firing bug */}
        <motion.div 
          initial={{ y: 0 }} whileInView={{ y: "100%" }} viewport={{ once: true }} transition={{ duration: 1.2, ease: easeCurve }}
          className="absolute inset-0 bg-[#F9F9F8] z-20"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <div className="overflow-hidden mb-6">
          <motion.span 
            initial={{ y: "100%" }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: easeCurve }}
            className="text-8xl md:text-9xl font-light tracking-tighter text-zinc-200 block"
          >
            {facility.id}
          </motion.span>
        </div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: easeCurve }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="w-12 h-[1px] bg-zinc-950" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-950 uppercase">{facility.specs}</span>
        </motion.div>
        <div className="overflow-hidden mb-8">
          <motion.h3 
            initial={{ y: "100%" }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: easeCurve }}
            className="text-4xl md:text-6xl font-light tracking-tight text-zinc-950 leading-[1.1]"
          >
            {facility.title}
          </motion.h3>
        </div>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3, ease: easeCurve }}
          className="text-zinc-500 text-lg md:text-xl font-light leading-relaxed max-w-lg"
        >
          {facility.description}
        </motion.p>
      </div>
    </div>
  );
};

const InteractiveAmenities = () => {
  const [active, setActive] = useState("fridge");

  return (
    <div className="w-full h-[500px] md:h-[600px] flex flex-col md:flex-row gap-4">
      {AMENITIES.map((amenity) => {
        const isActive = active === amenity.id;
        return (
          <motion.div
            key={amenity.id}
            onHoverStart={() => setActive(amenity.id)}
            onClick={() => setActive(amenity.id)} 
            animate={{ 
              flex: isActive ? 3 : 1,
              backgroundColor: isActive ? "#09090b" : "#e4e4e7" 
            }}
            transition={{ duration: 0.6, ease: easeCurve }}
            className="relative overflow-hidden rounded-3xl cursor-crosshair flex flex-col justify-end p-6 md:p-10 group"
          >
            <motion.div 
              animate={{ 
                scale: isActive ? 1.1 : 0.85,
                opacity: isActive ? 0.15 : 0.05,
                color: isActive ? "#ffffff" : "#000000",
                rotate: isActive ? 0 : 5
              }}
              transition={{ duration: 0.6, ease: easeCurve }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {amenity.icon}
            </motion.div>

            <div className="relative z-10 flex flex-col justify-end h-full">
               <motion.div animate={{ opacity: isActive ? 1 : 0.6 }}>
                 <span className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 block ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                   {amenity.specs}
                 </span>
                 
                 <h3 className={`text-3xl md:text-5xl font-light tracking-tight mb-4 ${isActive ? 'text-white' : 'text-zinc-900'} origin-left whitespace-nowrap`}>
                   {amenity.title}
                 </h3>
               </motion.div>
               
               <AnimatePresence mode="wait">
                 {isActive && (
                   <motion.div
                     initial={{ opacity: 0, height: 0, y: 10 }}
                     animate={{ opacity: 1, height: "auto", y: 0 }}
                     exit={{ opacity: 0, height: 0, y: 10 }}
                     transition={{ duration: 0.4, ease: easeCurve }}
                     className="overflow-hidden"
                   >
                     <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed max-w-md mt-2">
                       {amenity.description}
                     </p>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default function FacilitiesPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F8] selection:bg-zinc-950 selection:text-[#F9F9F8] pt-40 pb-32">
      
      {/* Editorial Header */}
      <div className="px-6 max-w-7xl mx-auto mb-32 md:mb-48">
        <motion.span 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: easeCurve }}
          className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-6 block"
        >
          Lakshya PG // The Ecosystem
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: easeCurve }}
          className="text-5xl md:text-8xl lg:text-[140px] font-light tracking-tighter leading-[0.9] text-zinc-950"
        >
          Precision <br />
          <span className="text-zinc-400">Environment.</span>
        </motion.h1>
      </div>

      {/* Sections 01 to 03 (Core Infrastructure) */}
      <div className="max-w-7xl mx-auto px-6">
        {CORE_FACILITIES.map((facility, index) => (
          <FacilityBlock key={facility.id} facility={facility} index={index} />
        ))}
      </div>

      {/* Section 04 - The New Accordion System */}
      <div className="max-w-7xl mx-auto px-6 mt-32 md:mt-48">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: easeCurve }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-[1px] bg-zinc-950" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-950 uppercase">
              04 // The Details
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-zinc-950 mb-12">
            Essential <span className="text-zinc-400">Amenities.</span>
          </h2>
          
          <InteractiveAmenities />
        </motion.div>
      </div>

      {/* Final Call to Action */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: easeCurve }}
        className="max-w-7xl mx-auto px-6 mt-40 pt-20 border-t border-zinc-200 flex flex-col items-center text-center"
      >
        <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-zinc-950 mb-10">
          Secure your place in <br className="hidden md:block" />
          <span className="text-zinc-400">the ecosystem.</span>
        </h2>
        
        <button 
          className="group relative flex h-16 w-56 items-center justify-center overflow-hidden rounded-full bg-zinc-950 transition-all hover:scale-105 active:scale-95"
          onClick={() => console.log("Contact routing to be implemented")}
        >
          <motion.div 
            className="absolute inset-0 bg-zinc-800"
            initial={{ y: "100%" }}
            whileHover={{ y: 0 }}
            transition={{ duration: 0.4, ease: easeCurve }}
          />
          <span className="relative z-10 text-[10px] font-bold tracking-[0.2em] text-[#F9F9F8] uppercase flex items-center gap-2">
            Contact Us
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform group-hover:translate-x-1">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </button>
      </motion.div>

    </div>
  );
}