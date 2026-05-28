"use client";

import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Search, Calendar, X, Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ShipmentMap = dynamic(() => import('@/components/ShipmentMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-zinc-500 font-mono text-xs">Loading Map Engine...</div>
});

type Shipment = { id: string; batch: string; origin: string; destination: string; driver: string; temp: number; status: string; lastUpdate: string; progress: number; eta: string };

export default function ShipmentsPage() {
  const [filter, setFilter] = useState('ALL');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newShipment, setNewShipment] = useState({ batch: '', origin: '', destination: '', driver: '', driverPhone: '' });
  const [saving, setSaving] = useState(false);

  async function fetchShipments() {
    try {
      const res = await fetch(`/api/shipments?status=${filter}`);
      const data = await res.json();
      setShipments(data);
      if (data.length > 0 && !selectedShipment) {
        setSelectedShipment(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch shipments:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShipments();
  }, [filter]);

  async function handleCreateShipment(e: React.FormEvent) {
    e.preventDefault();
    if (!newShipment.batch || !newShipment.origin || !newShipment.destination || !newShipment.driver || !newShipment.driverPhone) return;
    
    setSaving(true);
    try {
      await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShipment),
      });
      setShowCreateModal(false);
      setNewShipment({ batch: '', origin: '', destination: '', driver: '', driverPhone: '' });
      fetchShipments();
    } catch (err) {
      console.error('Failed to create shipment:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteShipment(shipmentId: string) {
    if (!confirm('Are you sure you want to delete this shipment? All telemetry logs will be lost.')) return;
    try {
      const res = await fetch(`/api/shipments?id=${encodeURIComponent(shipmentId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        if (selectedShipment?.id === shipmentId) setSelectedShipment(null);
        fetchShipments();
      }
    } catch (err) {
      console.error('Failed to delete shipment:', err);
    }
  }

  const filtered = searchTerm 
    ? shipments.filter(s => s.id.toLowerCase().includes(searchTerm.toLowerCase()) || s.batch.toLowerCase().includes(searchTerm.toLowerCase()))
    : shipments;

  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col gap-6">
        <div className="skeleton h-10 w-64 rounded"></div>
        <div className="flex gap-6 flex-1">
          <div className="w-1/3 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-lg"></div>)}</div>
          <div className="flex-1 skeleton rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight border-l-4 border-blue-500 pl-3">Shipments & Routing</h1>
          <p className="text-zinc-500 text-sm mt-1 pl-4">End-to-end trace view of all consignments.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold flex items-center gap-2 rounded text-sm transition font-mono tracking-widest">
            <Plus className="w-4 h-4" /> CREATE SHIPMENT
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex gap-4 items-center shrink-0 flex-wrap">
        <div className="flex bg-[#111] p-1 border border-[#222] rounded text-sm">
          {['ALL', 'LOADING', 'IN TRANSIT', 'DELAYED', 'BREACH', 'DELIVERED'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded transition font-mono text-[10px] tracking-widest ${filter === f ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 bg-[#111] border border-[#222] px-3 py-1.5 rounded text-sm w-48 focus-within:border-[#3b82f6] transition-colors">
           <Search className="w-4 h-4 text-zinc-500" />
           <input 
             type="text" 
             placeholder="Search ID..." 
             className="bg-transparent border-none outline-none w-full font-mono placeholder:font-sans text-xs"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Main Content Layout (Master Detail) */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
         {/* List View */}
         <div className="w-1/2 lg:w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
            {filtered.length === 0 && <div className="text-zinc-500 text-sm p-4 text-center">No shipments match filter.</div>}
            
            {filtered.map(s => {
              const isSelected = selectedShipment?.id === s.id;
              return (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedShipment(s)}
                  className={`bg-[#111] border rounded-lg p-4 cursor-pointer transition group ${isSelected ? 'border-blue-500/50 bg-[#16161a]' : 'border-[#222] hover:border-[#444]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-mono text-blue-400 mb-1">#{s.id.replace('SHP-', '')}</div>
                      <div className="font-semibold text-zinc-200">{s.batch}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteShipment(s.id); }} 
                        className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-900/20 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 relative mt-4">
                    <div className="absolute left-2.5 top-2 bottom-2 w-px bg-zinc-800 -z-10"></div>
                    <div className="flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full bg-[#0a0a0a] border border-zinc-700 flex items-center justify-center shrink-0 z-10"><div className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></div></div>
                       <div className="text-xs text-zinc-400 font-mono">{s.origin}</div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full bg-blue-900/20 border border-blue-900/50 flex items-center justify-center shrink-0 z-10"><MapPin className="w-2.5 h-2.5 text-blue-400" /></div>
                       <div className="text-xs font-medium text-white font-mono">{s.destination}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#222] flex justify-between items-center text-xs">
                     <div className="text-zinc-500 font-mono tracking-tight">{s.driver}</div>
                     <div className="flex items-center gap-4">
                       <div className={`font-mono font-bold ${s.temp > 8 ? 'text-red-500 animate-pulse' : 'text-[#10b981]'}`}>{s.status === 'DELIVERED' ? '-' : `${s.temp.toFixed(1)}°C`}</div>
                       <div className="text-zinc-500 font-mono tracking-tight">{s.progress}%</div>
                     </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 w-full bg-black rounded mt-3 overflow-hidden">
                    <div className={`h-full ${s.status === 'DELIVERED' ? 'bg-[#10b981]' : s.status === 'BREACH' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${s.progress}%` }}></div>
                  </div>
                </div>
              );
            })}
         </div>

         {/* Detail Panel */}
         <div className="hidden lg:flex flex-1 bg-[#111] border border-[#222] rounded-lg flex-col overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-[#0a0a0a] border border-[#333] px-3 py-1.5 rounded flex items-center gap-2">
              <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></span>
              <span className="font-mono text-[10px] tracking-widest text-zinc-300">LIVE TELEMATICS</span>
            </div>
            
             <div className="flex-1 border-b border-[#222] relative z-0">
               {selectedShipment ? (
                 <ShipmentMap 
                   origin={selectedShipment.origin} 
                   destination={selectedShipment.destination}
                   progress={selectedShipment.progress}
                   shipmentId={selectedShipment.id}
                   status={selectedShipment.status}
                 />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
                    <MapPin className="w-12 h-12 text-zinc-500 mb-4" />
                    <p className="text-zinc-400 font-mono uppercase tracking-widest text-sm">Select a shipment</p>
                 </div>
               )}
             </div>

             {selectedShipment && (
               <div className="h-[250px] bg-[#161616] p-6 flex flex-col justify-between shrink-0">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-mono text-xl font-bold text-white">{selectedShipment.id}</h3>
                          <a 
                            href={`/driver/${selectedShipment.id}`} 
                            target="_blank"
                            className="bg-blue-900/40 border border-blue-500/50 text-blue-400 text-[10px] px-2 py-0.5 rounded font-mono hover:bg-blue-500 hover:text-white transition-colors"
                          >
                            OPEN DRIVER TERMINAL ↗
                          </a>
                        </div>
                        <p className="text-zinc-400 text-sm">{selectedShipment.batch}</p>
                      </div>
                      <StatusBadge status={selectedShipment.status} />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-4 gap-4 mt-6">
                   <div className="bg-[#0a0a0a] border border-[#222] rounded p-3 text-center">
                     <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Driver</div>
                     <div className="font-mono text-sm text-zinc-300 truncate">{selectedShipment.driver}</div>
                   </div>
                   <div className="bg-[#0a0a0a] border border-[#222] rounded p-3 text-center">
                     <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Temperature</div>
                     <div className={`font-mono text-lg ${selectedShipment.temp > 8 ? 'text-red-500' : 'text-[#10b981]'}`}>{selectedShipment.status === 'DELIVERED' ? '-' : selectedShipment.temp.toFixed(1)} <span className="text-xs">°C</span></div>
                   </div>
                   <div className="bg-[#0a0a0a] border border-[#222] rounded p-3 text-center">
                     <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">ETA</div>
                     <div className="font-mono text-lg text-zinc-300">{selectedShipment.eta}</div>
                   </div>
                   <div className="bg-[#0a0a0a] border border-[#222] rounded p-3 text-center">
                     <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Progress</div>
                     <div className="font-mono text-lg text-blue-400">{selectedShipment.progress}%</div>
                   </div>
                 </div>
               </div>
             )}
         </div>
      </div>

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateShipment}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2"><Truck className="w-5 h-5 text-blue-400" /> New Shipment</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Batch Name', key: 'batch' as const, placeholder: 'e.g. Naivasha Roses B.008' },
                { label: 'Origin', key: 'origin' as const, placeholder: 'e.g. Naivasha Farm' },
                { label: 'Destination', key: 'destination' as const, placeholder: 'e.g. JKIA Export Hub' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">{field.label}</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder={field.placeholder}
                    value={newShipment[field.key]}
                    onChange={e => setNewShipment({...newShipment, [field.key]: e.target.value})}
                    required
                  />
                </div>
              ))}
                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Driver Name</label>
                  <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono"
                    value={newShipment.driver} onChange={e => setNewShipment({...newShipment, driver: e.target.value})} placeholder="e.g. Omondi" required />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Driver Phone</label>
                  <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono"
                    value={newShipment.driverPhone} onChange={e => setNewShipment({...newShipment, driverPhone: e.target.value})} placeholder="e.g. +2547XXXXXXXX" required />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={saving || !newShipment.batch || !newShipment.origin || !newShipment.destination || !newShipment.driver || !newShipment.driverPhone}
                className="w-full mt-6 py-3 bg-blue-500 text-white font-bold rounded text-sm hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'CREATING...' : 'CREATE SHIPMENT'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'IN TRANSIT': 'bg-blue-950 text-blue-400 border-blue-900',
    'DELIVERED': 'bg-green-950 text-green-400 border-green-900',
    'BREACH': 'bg-red-950 text-red-400 border-red-900 font-bold tracking-widest',
    'DELAYED': 'bg-amber-950 text-amber-400 border-amber-900',
    'LOADING': 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };
  const color = colors[status] || 'bg-zinc-950 text-zinc-400 border-zinc-900';
  
  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono ${color}`}>
      {status}
    </span>
  );
}
