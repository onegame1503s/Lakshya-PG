"use client";

import { motion } from "framer-motion";
import { useState, useRef, useMemo } from "react";

const PROXIMITY_DATA = [
  {
    id: "needs", 
    metric: "00",
    unit: "MINS",
    title: "Immediate Daily Needs",
    description: "An unlisted provision store is situated immediately next to the premises, ensuring instant access to everyday essentials with zero transit time."
  },
  {
    id: "coaching", 
    metric: "15",
    unit: "MINS",
    title: "Premier Coaching Hubs",
    description: "Strategically located for rapid transit to Haldwani's major educational corridors. A network of top institutes like Aakash, Physics Wallah, and Allen surrounds the area."
  },
  {
    id: "gym", 
    metric: "02",
    unit: "MINS",
    title: "Pratibimb & Extreme Fitness",
    description: "Top-tier fitness infrastructure is located just steps up the road, making it incredibly easy to maintain physical health alongside academic rigor."
  },
  {
    id: "medical",
    metric: "03",
    unit: "MINS",
    title: "Vivekanand Hospital",
    description: "Zero-delay emergency infrastructure. Vivekanand Hospital is located just a short walk up the street, with Sai Hospital also in extreme proximity."
  },
  {
    id: "diagnostics",
    metric: "04",
    unit: "MINS",
    title: "Satyam Diagnostics Centre",
    description: "Full-scale pathology and diagnostic infrastructure located immediately East of the PG, ensuring health monitoring is effortless."
  },
  {
    id: "temple",
    metric: "05",
    unit: "MINS",
    title: "Poornagiri Mata Temple",
    description: "A prominent local landmark and spiritual center situated just North-West of the base, providing a quiet space for mental clarity."
  }
];

// Expanded to include multiple coaching pins. isPrimary tells the map which one to center on.
const MAP_PINS = [
  { id: "needs", title: "Local Shop", top: 51.5, left: 48.2, color: "bg-zinc-800", isPrimary: true },
  { id: "gym", title: "Fitness Gym", top: 38, left: 53, color: "bg-zinc-800", isPrimary: true },
  { id: "medical", title: "Vivekanand Hospital", top: 31, left: 58, color: "bg-red-600", isPrimary: true },
  { id: "diagnostics", title: "Satyam Diagnostics", top: 48, left: 68, color: "bg-blue-600", isPrimary: true },
  { id: "temple", title: "Poornagiri Temple", top: 20, left: 35, color: "bg-orange-500", isPrimary: true },
  // Multi-node Coaching Network
  { id: "coaching", title: "Physics Wallah", top: 60, left: 35, color: "bg-zinc-800", isPrimary: true },
  { id: "coaching", title: "Aakash Institute", top: 72, left: 25, color: "bg-zinc-800", isPrimary: false },
  { id: "coaching", title: "Allen", top: 65, left: 48, color: "bg-zinc-800", isPrimary: false },
];

const easeCurve = [0.22, 1, 0.36, 1];

export default function LocalityPage() {
  const [activeFocus, setActiveFocus] = useState<string | null>(null);
  const mapConstraintsRef = useRef<HTMLDivElement>(null);

  const mapPanCoordinates = useMemo(() => {
    if (!activeFocus) return { x: "0%", y: "0%" };
    // Find the primary pin for panning so the map centers smoothly on the cluster
    const activePin = MAP_PINS.find(pin => pin.id === activeFocus && pin.isPrimary) || MAP_PINS.find(pin => pin.id === activeFocus);
    if (!activePin) return { x: "0%", y: "0%" };
    
    return {
      x: `${50 - activePin.left}%`,
      y: `${50 - activePin.top}%`
    };
  }, [activeFocus]);

  return (
    <div className="bg-[#F9F9F8] min-h-screen selection:bg-zinc-950 selection:text-[#F9F9F8]">
      <div className="flex flex-col lg:flex-row w-full">
        
        {/* Left Column: The Draggable, Auto-Panning Canvas Boundary */}
        <div 
          ref={mapConstraintsRef}
          className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 relative h-[60vh] bg-[#f0f0f0] overflow-hidden border-r border-zinc-200/50"
        >
          <motion.div
            drag
            dragConstraints={mapConstraintsRef}
            dragElastic={0.1}
            animate={mapPanCoordinates}
            transition={{ duration: 1.2, ease: easeCurve }}
            className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-grab active:cursor-grabbing"
          >
            <div className="absolute inset-0 pointer-events-none">
              <iframe 
                src="https://maps.google.com/maps?q=6G99+XR%20Haldwani,%20Uttarakhand&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                className="w-full h-full border-0 filter grayscale-[20%] contrast-100 brightness-110 opacity-90"
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none">
              
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-opacity duration-500 ${activeFocus === null ? 'opacity-100' : 'opacity-40'}`}>
                <div className="relative flex items-center justify-center">
                  {activeFocus === null && <div className="absolute w-24 h-24 bg-zinc-950/20 rounded-full animate-ping" />}
                  <div className="w-6 h-6 bg-zinc-950 border-4 border-white rounded-full shadow-2xl z-10" />
                </div>
                <div className="mt-4 bg-zinc-950 text-white px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase shadow-xl whitespace-nowrap">
                  Lakshya PG Base
                </div>
              </div>

              {MAP_PINS.map((pin, index) => (
                <div 
                  key={index} // Using index because IDs are no longer entirely unique (coaching)
                  style={{ top: `${pin.top}%`, left: `${pin.left}%` }}
                  className={`absolute flex items-center gap-2 transition-all duration-500 -translate-x-1/2 -translate-y-1/2 ${
                    activeFocus === pin.id ? 'opacity-100 scale-110 z-30' : 'opacity-60 scale-90 z-10'
                  }`}
                >
                  <div className="relative flex justify-center items-center">
                    {/* The glow effect triggers for ALL pins that match the activeFocus ID */}
                    {activeFocus === pin.id && <div className={`absolute w-12 h-12 ${pin.color.replace('bg-', 'bg-').replace('500', '500/20').replace('600', '600/20').replace('800', '900/20')} rounded-full animate-ping`} />}
                    <div className={`w-2.5 h-2.5 ${pin.color} rounded-full border border-white z-10 shadow-md`} />
                  </div>
                  <div className={`backdrop-blur-md px-2.5 py-1.5 text-[8.5px] font-bold tracking-[0.1em] uppercase border shadow-sm transition-colors whitespace-nowrap ${
                    activeFocus === pin.id ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white/90 text-zinc-600 border-zinc-200'
                  }`}>
                    {pin.title}
                  </div>
                </div>
              ))}

            </div>
          </motion.div>
        </div>

        {/* Right Column: Interactive Data Density */}
        <div className="lg:w-1/2 px-6 py-24 lg:py-48 lg:px-24 overflow-y-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeCurve }}
            className="mb-24"
          >
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-6 block">
              Strategic Placement
            </span>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-tight text-zinc-950">
              Positioned for <br />
              <span className="font-bold">absolute efficiency.</span>
            </h1>
            <p className="mt-6 text-zinc-500 font-light max-w-md mb-8">
              Hover over the infrastructure nodes below. The map will automatically align to track their exact proximity relative to Lakshya PG.
            </p>

            <a 
              href="https://maps.app.goo.gl/YxAuy7eaLKF4q5WT9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-zinc-950 text-white px-8 py-4 text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-zinc-800 transition-colors shadow-lg"
            >
              Open in Google Maps
              <svg className="ml-3 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          </motion.div>

          <div className="flex flex-col gap-16 relative z-20">
            {PROXIMITY_DATA.map((data, index) => (
              <motion.div 
                key={data.id}
                onMouseEnter={() => setActiveFocus(data.id)}
                onMouseLeave={() => setActiveFocus(null)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: easeCurve }}
                className={`relative p-8 -mx-8 rounded-3xl transition-colors duration-500 cursor-crosshair ${activeFocus === data.id ? 'bg-white shadow-xl border border-zinc-100' : 'hover:bg-zinc-100/50'}`}
              >
                <div className="flex items-baseline gap-4 mb-4">
                  <span className={`text-6xl md:text-8xl font-light tracking-tighter leading-none transition-colors duration-500 ${activeFocus === data.id ? 'text-zinc-950' : 'text-zinc-400'}`}>
                    {data.metric}
                  </span>
                  <span className="text-lg md:text-xl font-bold tracking-[0.1em] text-zinc-300 uppercase">
                    {data.unit}
                  </span>
                </div>
                
                <div className="border-t border-zinc-200 pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-950">
                      {data.title}
                    </h2>
                  </div>
                  <p className="text-zinc-500 text-sm md:text-base font-light leading-relaxed max-w-md">
                    {data.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}