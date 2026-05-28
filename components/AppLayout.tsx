"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Box,
  Warehouse,
  Truck,
  Users,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  Menu,
  X,
  Bell,
} from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const alertsRef = useRef<HTMLDivElement>(null);

  const isAuthOrLanding = pathname === "/" || pathname === "/login" || pathname === "/signup";

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Inventory", href: "/inventory", icon: <Box className="w-4 h-4" /> },
    { name: "Warehouse", href: "/warehouse", icon: <Warehouse className="w-4 h-4" /> },
    { name: "Shipments", href: "/shipments", icon: <Truck className="w-4 h-4" /> },
    { name: "Suppliers", href: "/suppliers", icon: <Users className="w-4 h-4" /> },
    { name: "Reports", href: "/reports", icon: <BarChart3 className="w-4 h-4" /> },
    { name: "SMS Guide", href: "/sms-guide", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  // Fetch alerts for the dropdown (only if not on landing/auth pages)
  useEffect(() => {
    if (isAuthOrLanding) return;
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => setAlerts(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {});
  }, [isAuthOrLanding]);

  // Close alerts dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setAlertsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const highAlerts = alerts.filter(a => a.severity === 'red').length;

  if (isAuthOrLanding) {
    return <div className="h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-[#10b981] selection:text-white flex flex-col">{children}</div>;
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#10b981] selection:text-white overflow-hidden">
      {/* Header */}
      <header className="h-[64px] shrink-0 border-b border-[#222222] flex items-center justify-between px-4 sm:px-6 bg-[#111111]">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-1.5 rounded hover:bg-[#222] transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
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

          {/* Alerts Dropdown */}
          <div className="relative" ref={alertsRef}>
            <button 
              onClick={() => setAlertsOpen(!alertsOpen)}
              className="relative p-2 bg-[#222222] rounded-full cursor-pointer hover:bg-zinc-700 transition"
            >
               <Bell className="w-4 h-4 text-zinc-400" />
              {highAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ef4444] rounded-full border-2 border-[#111111] text-[8px] flex items-center justify-center font-bold">
                  {highAlerts}
                </span>
              )}
            </button>

            {alertsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#111] border border-[#333] rounded-lg shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-[#222] flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recent Alerts</span>
                  <Link href="/dashboard" className="text-[10px] text-blue-400 hover:text-blue-300 transition">View All</Link>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {alerts.map(a => {
                    const color = a.severity === 'red' ? 'text-red-400' : a.severity === 'amber' ? 'text-amber-400' : 'text-green-400';
                    return (
                      <div key={a.id} className="p-3 border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className={`${color} font-bold uppercase`}>{a.type}</span>
                          <span className="text-zinc-500 font-mono">{new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="text-xs text-zinc-400">{a.message}</div>
                      </div>
                    );
                  })}
                  {alerts.length === 0 && <div className="p-4 text-center text-zinc-500 text-xs">No alerts</div>}
                </div>
              </div>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-zinc-600 flex items-center justify-center font-bold text-xs">
            OP
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-[#111] border-r border-[#222] p-4 pt-20" onClick={e => e.stopPropagation()}>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
         {children}
      </div>

      {/* Footer */}
      <footer className="h-8 shrink-0 border-t border-[#222222] bg-[#0a0a0a] px-4 flex items-center justify-between text-[10px] text-zinc-600 font-mono">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1 text-emerald-500/70">
            <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse"></span> SYSTEM: ONLINE
          </span>
          <span className="flex items-center gap-1 text-zinc-500 hidden sm:flex">
            NEON DB CONNECTED
          </span>
        </div>
        <div className="flex gap-4">
          <span className="text-zinc-800 tracking-tighter uppercase hidden sm:inline font-bold">ChainPulse v2.0</span>
        </div>
      </footer>
    </div>
  );
}
