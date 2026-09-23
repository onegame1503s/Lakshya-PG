"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, UserCircle, ArrowRight, PhoneCall } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="flex flex-col">
          <span className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
            LAKSHYA<span className="text-blue-600">PG</span>
          </span>
          <div className="overflow-hidden pt-1">
            <motion.span
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 0.9,
                duration: 0.6, 
                type: "spring", 
                stiffness: 120 
              }}
              className="block text-xs font-bold uppercase tracking-widest text-slate-500"
            >
              Only for boys
            </motion.span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center font-medium text-slate-700">
          <Link href="/rooms" className="hover:text-blue-600 transition-colors">Rooms</Link>
          <Link href="/facilities" className="hover:text-blue-600 transition-colors">Facilities</Link>
          <Link href="/locality" className="hover:text-blue-600 transition-colors">Locality</Link>
          
          {/* Contact Us Button */}
          <a href="tel:+919876543210" className="flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 transition-colors">
            <PhoneCall className="w-4 h-4" />
            Contact Us
          </a>
          
          <div className="flex items-center space-x-6 pl-6 border-l border-slate-200">
            <Link 
              href="/student/login" 
              className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <UserCircle className="w-5 h-5" />
              <span>Login</span>
            </Link>
            
            <Link 
              href="/apply" 
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all transform hover:scale-105 shadow-md shadow-slate-900/20 text-sm font-bold flex items-center gap-2"
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl overflow-hidden"
          >
            <div className="flex flex-col space-y-4 px-6 py-6">
              <Link 
                href="/rooms" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-semibold text-slate-800"
              >
                Rooms
              </Link>
              
              <Link 
                href="/facilities" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-semibold text-slate-800"
              >
                Facilities
              </Link>

              <Link 
                href="/locality" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-semibold text-slate-800"
              >
                Locality
              </Link>

              {/* Mobile Contact Us Button */}
              <a 
                href="tel:+919876543210" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-lg font-bold text-blue-600"
              >
                <PhoneCall className="w-5 h-5" />
                Contact Us
              </a>

              <div className="h-px bg-slate-100 w-full my-2"></div>

              <Link 
                href="/student/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-lg font-semibold text-slate-800"
              >
                Portal Login <UserCircle className="w-6 h-6 text-slate-400" />
              </Link>

              <Link 
                href="/apply" 
                onClick={() => setMobileMenuOpen(false)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium w-full shadow-lg shadow-blue-600/30 mt-2 flex items-center justify-center gap-2 text-lg"
              >
                Apply for Admission <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}