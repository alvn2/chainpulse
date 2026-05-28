"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  Warehouse,
  Truck,
  Users,
  BarChart3,
  MessageSquare,
  AlertTriangle
} from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Inventory", href: "/inventory", icon: <Box className="w-4 h-4" /> },
    { name: "Warehouse", href: "/warehouse", icon: <Warehouse className="w-4 h-4" /> },
    { name: "Shipments", href: "/shipments", icon: <Truck className="w-4 h-4" /> },
    { name: "Suppliers", href: "/suppliers", icon: <Users className="w-4 h-4" /> },
    { name: "Reports", href: "/reports", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#10b981] selection:text-white overflow-hidden">
      {/* Header */}
      <header className="h-[64px] shrink-0 border-b border-[#222222] flex items-center justify-between px-6 bg-[#111111]">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10b981] rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tighter">
              Chain<span className="text-[#10b981]">Pulse</span>
            </h1>
          </Link>
          <div className="hidden sm:block h-4 w-px bg-[#222222]"></div>
          
          <nav className="hidden lg:flex items-center space-x-1 border border-[#222] bg-black p-1 rounded-lg">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active ? "bg-[#222222] text-white" : "text-zinc-500 hover:text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  <span className={active ? "text-[#10b981]" : ""}>{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-zinc-500 uppercase flex items-center justify-end gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
               System Nominal
            </div>
          </div>
          <div className="relative p-2 bg-[#222222] rounded-full cursor-pointer hover:bg-zinc-700 transition">
             <AlertTriangle className="w-4 h-4 text-zinc-400" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-[#111111] animate-pulse"></span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-zinc-600 flex items-center justify-center font-bold text-xs">
            OP
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
         {children}
      </div>

      {/* Footer */}
      <footer className="h-8 shrink-0 border-t border-[#222222] bg-[#0a0a0a] px-4 flex items-center justify-between text-[10px] text-zinc-600 font-mono">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1 text-emerald-500/70">
            <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse"></span> SYSTEM: ONLINE
          </span>
          <span className="flex items-center gap-1 hidden sm:flex text-zinc-500">
            MOCK DATA MODE
          </span>
        </div>
        <div className="flex gap-4">
          <span className="text-zinc-800 tracking-tighter uppercase hidden sm:inline font-bold">ChainPulse v2.0</span>
        </div>
      </footer>
    </div>
  );
}
