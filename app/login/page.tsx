"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10b981] rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tighter">Chain<span className="text-[#10b981]">Pulse</span></span>
          </Link>
        </div>

        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
          <p className="text-zinc-500 text-sm mb-8">Enter your details to access the dashboard.</p>

          <form className="space-y-4" action="/dashboard">
            <div>
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Email</label>
              <input 
                type="email" 
                defaultValue="admin@chainpulse.com"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#10b981] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Password</label>
              <input 
                type="password" 
                defaultValue="password123"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#10b981] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-xs mt-2">
               <label className="flex items-center gap-2 text-zinc-400">
                 <input type="checkbox" className="rounded bg-[#0a0a0a] border-[#333] accent-[#10b981]" /> Remember me
               </label>
               <a href="#" className="text-[#10b981] hover:underline">Forgot password?</a>
            </div>

            <button type="submit" className="w-full bg-white text-black font-bold rounded-lg py-3 mt-6 hover:bg-zinc-200 transition flex items-center justify-center gap-2 group">
              Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-600 justify-center bg-[#0a0a0a] border border-[#222] p-2 rounded">
             <Lock className="w-3 h-3" />
             Hackathon Demo: Authentication is simulated
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-zinc-500">
          Don&apos;t have an account? <Link href="/signup" className="text-white font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
