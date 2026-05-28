"use client";

import Link from "next/link";
import { ArrowRight, Box, BarChart3, Truck, MessageSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#10b981]/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#10b981] rounded flex items-center justify-center">
             <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <span className="text-xl font-bold tracking-tighter">Chain<span className="text-[#10b981]">Pulse</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium bg-white text-black px-6 py-2 rounded-full hover:bg-zinc-200 transition">Employee Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 max-w-5xl mx-auto pt-20 pb-32">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
          Supply Chain <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-emerald-300">Management System.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Internal operations portal for real-time cold chain monitoring, logistics tracking, and warehouse inventory control.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-[#10b981] text-black rounded-full font-bold text-lg hover:bg-emerald-400 transition flex items-center justify-center gap-2">
            Access HQ Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 text-left w-full">
           <div className="p-6 rounded-2xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#222]">
              <div className="w-12 h-12 bg-blue-950/30 border border-blue-900/50 rounded-lg flex items-center justify-center mb-6">
                 <Truck className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Live Telematics</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Track shipments in real-time. Automatically detect temperature breaches in your cold chain before cargo is lost.</p>
           </div>
           
           <div className="p-6 rounded-2xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#222]">
              <div className="w-12 h-12 bg-amber-950/30 border border-amber-900/50 rounded-lg flex items-center justify-center mb-6">
                 <Box className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Global Inventory</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Manage stock levels across multiple warehouse zones. Auto-generate purchase orders when thresholds are breached.</p>
           </div>

           <div className="p-6 rounded-2xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#222]">
              <div className="w-12 h-12 bg-emerald-950/30 border border-emerald-900/50 rounded-lg flex items-center justify-center mb-6">
                 <MessageSquare className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">SMS Integration</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Receive goods, update stock levels, and log temperatures directly from basic feature phones using Africa's Talking SMS API.</p>
           </div>
        </div>
      </main>
    </div>
  );
}

