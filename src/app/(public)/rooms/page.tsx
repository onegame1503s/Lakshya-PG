"use client";

import { useState } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// Muted architectural tones and heavy editorial density
const ROOM_DATA = {
  single: {
    id: "single",
    tag: "01 // CONFIGURATION",
    title: "Absolute Isolation.",
    specs: ["150 SQ FT", "CLIMATE CONTROLLED", "PRIVATE ERGONOMIC WORKSTATION"],
    description: "Engineered for uncompromising focus. The single occupancy module eliminates external variables, providing a dedicated sanctuary for intensive coaching preparation. Features maximized natural light penetration and acoustic dampening materials.",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop",
    layout: "md:col-span-6", // 50/50 Split
    imgAspect: "aspect-[4/5]",
  },
  double: {
    id: "double",
    tag: "02 // CONFIGURATION",
    title: "Symmetrical Synergy.",
    specs: ["220 SQ FT", "DUAL CLIMATE ZONES", "SEPARATED STORAGE ARMATURES"],
    description: "Designed for collaborative productivity without sacrificing physical boundaries. The double configuration utilizes a strict symmetrical layout to ensure equal spatial equity, dual study zones, and shared access to premium infrastructure.",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop",
    layout: "md:col-span-8", // 70/30 Split
    imgAspect: "aspect-[16/9] md:aspect-[21/9]",
  }
};

const easeCurve = [0.22, 1, 0.36, 1];

export default function UnifiedRoomsPage() {
  const [activeLayout, setActiveLayout] = useState<"single" | "double">("single");
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const currentRoom = ROOM_DATA[activeLayout];

  const handleApplyRouting = () => {
    setIsNavigating(true);
    // Wait for the cinematic sweep to finish before pushing the route
    setTimeout(() => {
      router.push("/apply");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8] selection:bg-zinc-950 selection:text-[#F9F9F8] pb-32">
      
      {/* Cinematic Sweep Overlay for Routing */}
      <motion.div
        initial={{ top: "100%" }}
        animate={{ top: isNavigating ? "0%" : "100%" }}
        transition={{ duration: 0.9, ease: easeCurve }}
        className="fixed inset-0 bg-zinc-950 z-50 flex items-center justify-center pointer-events-none"
      >
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: isNavigating ? 1 : 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] uppercase"
        >
          Initializing Admission Portal //
        </motion.span>
      </motion.div>

      {/* Editorial Header */}
      <div className="pt-40 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-6 block">
          Lakshya PG // Spatial Index
        </span>
        <h1 className="text-4xl md:text-7xl font-light tracking-tighter leading-none text-zinc-950 mb-12">
          Modular Environments.
        </h1>

        {/* The Sleek Pill Toggle */}
        <LayoutGroup>
          <div className="flex bg-zinc-200/50 p-1.5 rounded-full w-fit mx-auto relative shadow-inner">
            {(["single", "double"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveLayout(type)}
                className={`relative px-8 py-3 text-[10px] font-bold tracking-[0.15em] uppercase z-10 transition-colors duration-500 ${
                  activeLayout === type ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {type === "single" ? "Single Occupancy" : "Double Sharing"}
                {activeLayout === type && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-white rounded-full -z-10 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </LayoutGroup>
      </div>

      {/* The Morphing Adaptive Floorplan */}
      <div className="max-w-7xl mx-auto px-6">
        <LayoutGroup>
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center bg-white p-4 md:p-8 rounded-3xl border border-zinc-100 shadow-2xl shadow-zinc-200/50"
          >
            {/* Dynamic Image Container */}
            <motion.div 
              layout
              className={`${currentRoom.layout} relative overflow-hidden bg-zinc-200 rounded-2xl order-1`}
              transition={{ duration: 0.8, ease: easeCurve }}
            >
              <motion.div 
                layout
                className={`w-full ${currentRoom.imgAspect} relative`}
                transition={{ duration: 0.8, ease: easeCurve }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={currentRoom.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: easeCurve }}
                    className="absolute inset-0 bg-cover bg-center filter grayscale hover:grayscale-0 transition-all duration-[2s]"
                    style={{ backgroundImage: `url('${currentRoom.image}')` }}
                  />
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Dynamic Text & Stats Container */}
            <motion.div 
              layout
              className={`md:col-span-${currentRoom.id === 'single' ? '6' : '4'} flex flex-col justify-center order-2`}
              transition={{ duration: 0.8, ease: easeCurve }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentRoom.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: easeCurve }}
                >
                  <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-6 block border-b border-zinc-200/50 pb-4">
                    {currentRoom.tag}
                  </span>
                  
                  <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8 leading-tight text-zinc-950">
                    {currentRoom.title}
                  </h2>
                  
                  {/* Editorial Density: Micro-stats */}
                  <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8">
                    {currentRoom.specs.map((spec, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-zinc-400 rounded-full" />
                        <span className="text-[9px] font-bold tracking-[0.15em] text-zinc-500 uppercase">{spec}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-zinc-500 text-base font-light leading-relaxed mb-12">
                    {currentRoom.description}
                  </p>

                  <button 
                    onClick={handleApplyRouting}
                    className="group relative w-full bg-zinc-950 text-white py-6 overflow-hidden flex items-center justify-center"
                  >
                    <span className="relative z-10 text-xs font-bold tracking-[0.2em] uppercase group-hover:text-zinc-300 transition-colors duration-500">
                      Secure This Configuration
                    </span>
                    <div className="absolute inset-0 bg-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </LayoutGroup>
      </div>
    </div>
  );
}