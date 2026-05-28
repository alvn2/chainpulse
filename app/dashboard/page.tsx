'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Smartphone, Send } from 'lucide-react';

type Shipment = { id: string; batch: string; origin: string; destination: string; driver: string; temp: number; status: string; lastUpdate: string };
type Alert = { id: number; type: string; message: string; severity: 'red' | 'amber' | 'emerald' | 'blue' | 'green'; timestamp: string };
type DashboardStats = { totalSkus: number; activeShipments: number; coldBreachesToday: number; lowStockItems: number; pendingPOs: number };

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const [statsRes, shipmentsRes, alertsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/shipments'),
        fetch('/api/alerts'),
      ]);
      const [statsData, shipmentsData, alertsData] = await Promise.all([
        statsRes.json(),
        shipmentsRes.json(),
        alertsRes.json(),
      ]);
      setStats(statsData);
      setShipments(shipmentsData.filter((s: Shipment) => s.status !== 'DELIVERED').slice(0, 5));
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setTime(new Date()), 1000);
    // Auto-refresh data every 30 seconds
    const dataTimer = setInterval(fetchData, 30000);
    return () => {
      clearInterval(timer);
      clearInterval(dataTimer);
    };
  }, []);


  if (loading) {
    return (
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto h-full pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#111111] border border-[#222222] p-4 rounded-lg">
              <div className="skeleton h-3 w-20 mb-3"></div>
              <div className="skeleton h-8 w-16"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          <div className="lg:col-span-2 skeleton h-64 rounded-lg"></div>
          <div className="skeleton h-64 rounded-lg"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto h-full pr-2 custom-scrollbar">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 shrink-0">
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-lg">
          <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Total SKUs</div>
          <div className="text-2xl font-bold font-mono text-zinc-200">{stats?.totalSkus ?? 0}</div>
        </div>
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-lg">
          <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Active Shipments</div>
          <div className="text-2xl font-bold font-mono text-[#10b981]">{stats?.activeShipments ?? 0}</div>
          <div className="text-[10px] text-zinc-600 mt-2">Live tracking active</div>
        </div>
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-lg">
          <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Cold Breaches</div>
          <div className="text-2xl font-bold font-mono text-[#ef4444]">
             {(stats?.coldBreachesToday ?? 0) < 10 ? `0${stats?.coldBreachesToday ?? 0}` : stats?.coldBreachesToday}
          </div>
          {(stats?.coldBreachesToday ?? 0) > 0 && <div className="text-[10px] text-[#ef4444] mt-2 font-semibold uppercase tracking-tighter">Action Required</div>}
        </div>
        <Link href="/inventory" className="bg-[#111111] border border-[#222222] p-4 rounded-lg hover:border-amber-900/50 transition-colors">
          <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Low Stock Items</div>
          <div className="text-2xl font-bold font-mono text-amber-500">{stats?.lowStockItems ?? 0}</div>
          <div className="text-[10px] text-amber-500/70 mt-2 hover:text-white cursor-pointer transition-colors underline">View Inventory →</div>
        </Link>
        <Link href="/suppliers" className="bg-[#111111] border border-[#222222] p-4 rounded-lg hover:border-zinc-700 transition-colors">
          <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Pending Reorders</div>
          <div className="text-2xl font-bold font-mono text-amber-500">{stats?.pendingPOs ?? 0}</div>
          <div className="text-[10px] text-zinc-600 mt-2 hover:text-white transition-colors underline">View POs →</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-[400px]">
        {/* Left Col - Shipments & SMS */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex-1 bg-[#111111] border border-[#222222] rounded-lg flex flex-col overflow-hidden min-h-[250px]">
             <div className="p-3 border-b border-[#222222] flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Live Shipment Feed</h2>
              <div className="flex items-center gap-3">
                <button onClick={fetchData} className="text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-[#222]" title="Refresh">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-zinc-600">Showing {shipments.length} active</span>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="bg-[#0a0a0a] text-zinc-500 sticky top-0 z-10 shadow-[0_1px_0_#222] text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="p-3 font-normal whitespace-nowrap">ID</th>
                    <th className="p-3 font-normal">Batch/Origin</th>
                    <th className="p-3 font-normal">Destination</th>
                    <th className="p-3 font-normal text-center">Temp (°C)</th>
                    <th className="p-3 font-normal text-center">Status</th>
                    <th className="p-3 font-normal text-right">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-[#1a1a1a] transition-colors cursor-pointer" onClick={() => window.location.href = '/shipments'}>
                      <td className="p-3 text-blue-400 whitespace-nowrap font-bold">#{s.id.replace('SHP-', '')}</td>
                      <td className="p-3">
                        <span className="text-white font-sans">{s.batch}</span> <br/>
                        <span className="text-[10px] text-zinc-500">{s.origin}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap text-zinc-300">{s.destination}</td>
                      <td className={`p-3 text-center ${s.temp > 8 ? 'text-red-500 font-bold animate-pulse' : 'text-[#10b981]'}`}>
                        {s.temp.toFixed(1)}°
                      </td>
                      <td className="p-3 text-center">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="p-3 text-right text-zinc-500 whitespace-nowrap">
                        {new Date(s.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  ))}
                  {shipments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">No active shipments.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Alerts */}
        <div className="flex bg-[#111111] border border-[#222222] rounded-lg flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-[#222222] bg-[#161616] flex justify-between items-center shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">System Alerts</h3>
            <span className="text-[10px] bg-red-600 font-bold font-mono tracking-widest text-white px-2 py-0.5 rounded">{alerts.length} RECENT</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {alerts.map((a) => {
              const styles: Record<string, { bg: string; bar: string; text: string }> = {
                red: { bg: 'bg-red-950/20 border-red-900/50', bar: 'bg-red-600', text: 'text-red-500' },
                amber: { bg: 'bg-amber-950/20 border-amber-900/50', bar: 'bg-amber-600', text: 'text-amber-500' },
                emerald: { bg: 'bg-green-950/20 border-green-900/50', bar: 'bg-green-600', text: 'text-green-500' },
                green: { bg: 'bg-green-950/20 border-green-900/50', bar: 'bg-green-600', text: 'text-green-500' },
                blue: { bg: 'bg-zinc-800/20 border-zinc-700', bar: 'bg-blue-600', text: 'text-blue-500' },
              };
              const s = styles[a.severity] || styles.blue;
              
              return (
                <div key={a.id} className={`p-3 ${s.bg} border rounded flex gap-3 hover:bg-opacity-50 transition-colors`}>
                  <div className={`w-1 flex-shrink-0 ${s.bar} rounded`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] flex justify-between items-center mb-1">
                      <span className={`${s.text} font-bold uppercase tracking-tighter truncate leading-none`}>{a.type}</span>
                      <span className="text-zinc-500 shrink-0 ml-2 text-right leading-none font-mono">
                        {new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="text-xs mt-1 text-zinc-300 leading-snug break-words">
                      {a.message}
                    </div>
                  </div>
                </div>
              );
            })}
            {alerts.length === 0 && <div className="text-xs text-zinc-500 p-4 text-center">No recent alerts.</div>}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'IN TRANSIT': 'bg-blue-950 text-blue-400 border-blue-900',
    'DELIVERED': 'bg-green-950 text-green-400 border-green-900',
    'BREACH': 'bg-red-950 text-red-500 border-red-900 font-bold',
    'DELAYED': 'bg-amber-950 text-amber-400 border-amber-900',
    'LOADING': 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };
  const color = colors[status] || 'bg-zinc-950 text-zinc-400 border-zinc-900';
  
  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono tracking-widest ${color}`}>
      {status}
    </span>
  );
}
