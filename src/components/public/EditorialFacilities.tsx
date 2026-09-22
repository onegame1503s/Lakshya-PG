"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const HOSTEL_IMAGES = {
  room: "/room.jpg", 
  dining: "/dining.jpg" 
};

const cinematicReveal = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
};

// 1. MOBILE ONLY: Intensely tuned scroll tracker
const ScrollColorImage = ({ src }: { src: string }) => {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 100%", "end 0%"]
  });

  const filter = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 1], 
    [
      "grayscale(100%)", 
      "grayscale(100%)", 
      "grayscale(0%)", 
      "grayscale(100%)", 
      "grayscale(100%)"
    ]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 1],
    [1, 1, 1.08, 1, 1]
  );

  return (
    <div ref={ref} className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-200">
      <motion.div 
        style={{ filter, scale, backgroundImage: `url('${src}')` }}
        className="absolute inset-0 bg-cover bg-center"
      />
    </div>
  );
};

// 2. PC ONLY: Strict hover interaction
const HoverColorImage = ({ src }: { src: string }) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-200">
      <motion.div 
        initial={{ filter: "grayscale(100%)", scale: 1 }}
        whileHover={{ filter: "grayscale(0%)", scale: 1.05 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-cover bg-center cursor-pointer"
        style={{ backgroundImage: `url('${src}')` }}
      />
    </div>
  );
};

export default function EditorialFacilities() {
  return (
    <section className="py-32 md:py-48 px-6 bg-[#F9F9F8] text-zinc-950 selection:bg-zinc-950 selection:text-[#F9F9F8]">
      <div className="max-w-7xl mx-auto">
        
        <motion.div {...cinematicReveal} className="mb-24 md:mb-40 flex flex-col items-start border-t border-zinc-200/50 pt-8">
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-8">
            01 // Infrastructure
          </span>
          <h2 className="text-5xl md:text-8xl font-light tracking-tighter leading-[0.9] max-w-5xl">
            Designed for students. <br className="hidden md:block" />
            <span className="text-zinc-400">Zero distractions.</span>
          </h2>
        </motion.div>

        {/* Block 1: Rooms & Security */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 mb-24 md:mb-40 items-center">
          <motion.div {...cinematicReveal} className="md:col-span-7">
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-xl overflow-hidden shadow-2xl shadow-zinc-200/50">
              {/* Splits the rendering logic based on screen size */}
              <div className="block md:hidden absolute inset-0">
                <ScrollColorImage src={HOSTEL_IMAGES.room} />
              </div>
              <div className="hidden md:block absolute inset-0">
                <HoverColorImage src={HOSTEL_IMAGES.room} />
              </div>
            </div>
          </motion.div>
          
          <motion.div {...cinematicReveal} className="md:col-span-5 flex flex-col justify-center pt-8 md:pt-0">
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-6 block border-b border-zinc-200/50 pb-4">
              Accommodations & Security
            </span>
            <h3 className="text-3xl md:text-5xl font-light tracking-tight mb-6 leading-tight">
              Ironclad peace of mind.
            </h3>
            <p className="text-zinc-500 text-lg font-light leading-relaxed">
              Well-ventilated, meticulously maintained spaces featuring high-speed connectivity, continuous power backup, and 24/7 CCTV surveillance. Equipped with ergonomic study setups and dedicated quiet zones, every detail is optimized to support your academic goals and daily comfort.
            </p>
          </motion.div>
        </div>

        {/* Block 2: Meals & Routine */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center mb-32">
          <motion.div {...cinematicReveal} className="md:col-span-4 order-2 md:order-1 flex flex-col justify-center pt-8 md:pt-0">
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-6 block border-b border-zinc-200/50 pb-4">
              Routine & Nutrition
            </span>
            <h3 className="text-3xl md:text-5xl font-light tracking-tight mb-6 leading-tight">
              Precision in every meal.
            </h3>
            <p className="text-zinc-500 text-lg font-light leading-relaxed">
              Time is a student's most valuable asset. Nutritious breakfast, lunch, tea, and dinner are executed with absolute punctuality during fixed hours, maintaining your rigid study schedule without fail.
            </p>
          </motion.div>
          
          <motion.div {...cinematicReveal} className="md:col-span-8 order-1 md:order-2">
            <div className="relative w-full aspect-[4/5] md:aspect-[21/9] rounded-xl overflow-hidden shadow-2xl shadow-zinc-200/50">
              {/* Splits the rendering logic based on screen size */}
              <div className="block md:hidden absolute inset-0">
                <ScrollColorImage src={HOSTEL_IMAGES.dining} />
              </div>
              <div className="hidden md:block absolute inset-0">
                <HoverColorImage src={HOSTEL_IMAGES.dining} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* TEMPORARY ADMIN ACCESS BUTTON */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center border-t border-zinc-200/50 pt-16"
        >
          <Link href="/admin">
            <button className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase border border-zinc-300 px-8 py-4 rounded-full hover:bg-zinc-950 hover:text-white transition-all duration-300">
              Temp Admin Access
            </button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}