"use client";

import React, { useState, useEffect } from 'react';
import { Users, Phone, Star, FileText, Plus, X, CheckCircle, Trash2, Pencil, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Supplier = { id: string; name: string; location: string; cat: string; phone: string; score: number; activePOs: number };
type PO = { id: string; supplier_id: string; supplier_name: string; items: string; item_detail: string; total: number; status: string; expected: string; created_at: string };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pos, setPOs] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [poForm, setPOForm] = useState({ supplier_id: '', items: '', item_detail: '', total: '' });
  const [smsForm, setSmsForm] = useState({ phone: '', name: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  // New CRUD States
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ id: '', name: '', location: '', category: 'Perishable', phone: '' });
  const [editSupplierForm, setEditSupplierForm] = useState<Supplier | null>(null);

  async function fetchData() {
    try {
      const [supRes, poRes] = await Promise.all([
        fetch('/api/suppliers'),
        fetch('/api/purchase-orders'),
      ]);
      const [supData, poData] = await Promise.all([supRes.json(), poRes.json()]);
      setSuppliers(supData);
      setPOs(poData);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleCreatePO() {
    if (!poForm.supplier_id || !poForm.items || !poForm.item_detail || !poForm.total) return;
    setSaving(true);
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...poForm, total: parseFloat(poForm.total) }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('Purchase Order Created');
        setShowPOModal(false);
        setPOForm({ supplier_id: '', items: '', item_detail: '', total: '' });
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create PO');
      console.error('Failed to create PO:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePO(poId: string) {
    if (!confirm('Are you sure you want to delete this Purchase Order?')) return;
    try {
      const res = await fetch(`/api/purchase-orders?id=${encodeURIComponent(poId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else {
        toast.success('PO Deleted');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete PO');
      console.error('Failed to delete PO:', err);
    }
  }

  async function handleSaveSupplier(mode: 'create' | 'edit') {
    const payload = mode === 'create' ? supplierForm : editSupplierForm;
    if (!payload || !payload.id || !payload.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Supplier ${mode === 'create' ? 'created' : 'updated'} successfully`);
        setShowSupplierModal(false);
        setEditSupplierForm(null);
        if (mode === 'create') setSupplierForm({ id: '', name: '', location: '', category: 'Perishable', phone: '' });
        fetchData();
      }
    } catch (err) {
      toast.error(`Failed to ${mode} supplier`);
      console.error(`Failed to ${mode} supplier:`, err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSupplier(supId: string) {
    if (!confirm('Are you sure you want to delete this Supplier? All related Purchase Orders will also be deleted.')) return;
    try {
      const res = await fetch(`/api/suppliers?id=${encodeURIComponent(supId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else {
        toast.success('Supplier Deleted');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete supplier');
      console.error('Failed to delete supplier:', err);
    }
  }

  async function handleSendSMS() {
    if (!smsForm.phone || !smsForm.text) return;
    setSendingSMS(true);
    try {
      const res = await fetch('/api/sms/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: smsForm.phone, text: smsForm.text }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('SMS Sent Successfully!');
        setShowSMSModal(false);
        setSmsForm({ phone: '', name: '', text: '' });
      } else {
        toast.error(`Failed to send SMS: ${data.error}`);
      }
    } catch (err) {
      toast.error('Failed to send SMS');
      console.error('Failed to send SMS:', err);
    } finally {
      setSendingSMS(false);
    }
  }

  async function handleReceivePO(poId: string) {
    setReceivingId(poId);
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: poId, action: 'receive' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`PO Received! Added ${data.received} units of ${data.sku} to stock.`);
        fetchData();
      } else {
        toast.error(`Failed to receive: ${data.error}`);
      }
    } catch (err) {
      toast.error('Failed to receive PO');
      console.error('Failed to receive PO:', err);
    } finally {
      setReceivingId(null);
    }
  }

  const poStatusColors: Record<string, string> = {
    PENDING: 'bg-amber-950 text-amber-500 border-amber-900',
    CONFIRMED: 'bg-green-950 text-green-500 border-green-900',
    SHIPPED: 'bg-blue-950 text-blue-400 border-blue-900',
    RECEIVED: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48 rounded-lg"></div>)}
        </div>
        <div className="skeleton h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center shrink-0 border-l-4 border-amber-500 pl-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers & POs</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage vendor relations and purchase orders.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSupplierModal(true)} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold font-mono tracking-widest rounded text-xs transition flex items-center gap-2 border border-[#333]">
            <Building2 className="w-4 h-4" /> NEW SUPPLIER
          </button>
          <button onClick={() => setShowPOModal(true)} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono tracking-widest rounded text-xs transition flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Plus className="w-4 h-4" /> CREATE PO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {suppliers.map(sup => (
          <div key={sup.id} className="bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col hover:border-[#444] transition group">
            <div className="flex justify-between items-start mb-5 relative">
               <div>
                 <h3 className="font-bold text-white leading-tight font-sans text-lg">{sup.name}</h3>
                 <div className="text-xs text-zinc-500 font-mono tracking-tight mt-1">{sup.location} • {sup.cat}</div>
               </div>
               <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-[#333] px-2.5 py-1.5 rounded shadow-inner">
                   <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                   <span className="text-[10px] font-mono font-bold text-amber-500">{sup.score}</span>
                 </div>
                 <div className="flex gap-1">
                   <button onClick={() => setEditSupplierForm(sup)} className="p-1 text-zinc-600 hover:text-blue-400 transition bg-[#0a0a0a] rounded border border-[#333]"><Pencil className="w-3 h-3" /></button>
                   <button onClick={() => handleDeleteSupplier(sup.id)} className="p-1 text-zinc-600 hover:text-red-400 transition bg-[#0a0a0a] rounded border border-[#333]"><Trash2 className="w-3 h-3" /></button>
                 </div>
               </div>
            </div>
            
            <div className="space-y-3 mb-6 bg-[#0a0a0a] p-3 rounded border border-[#222]">
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <Phone className="w-3 h-3 text-zinc-500" /> 
                </div>
                <span className="font-mono text-xs">{sup.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3 text-zinc-500" />
                </div>
                <span className="text-xs font-mono"><span className="text-white font-bold">{sup.activePOs}</span> Active Orders</span>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-3 gap-3">
               <button 
                 onClick={() => { setPOForm({ ...poForm, supplier_id: sup.id }); setShowPOModal(true); }}
                 className="py-2 bg-[#0a0a0a] border border-[#333] text-zinc-300 rounded text-xs font-mono tracking-widest hover:bg-zinc-800 hover:text-white transition group-hover:border-zinc-500"
               >
                 NEW PO
               </button>
               <button 
                 onClick={() => { setSmsForm({ phone: sup.phone, name: sup.name, text: '' }); setShowSMSModal(true); }}
                 className="py-2 bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 rounded text-xs font-mono tracking-widest hover:bg-emerald-900/40 hover:border-emerald-500 transition text-center"
               >
                 SMS
               </button>
               <a 
                 href={`tel:${sup.phone}`}
                 className="py-2 bg-blue-950/20 border border-blue-900/50 text-blue-400 rounded text-xs font-mono tracking-widest hover:bg-blue-900/40 hover:border-blue-500 transition text-center flex items-center justify-center"
               >
                 CALL
               </a>
            </div>
          </div>
        ))}
      </div>
      
      {/* POs table */}
      <div className="bg-[#111] rounded-lg border border-[#222] overflow-hidden flex-1 shrink-0 flex flex-col min-h-[300px]">
         <div className="p-4 border-b border-[#222] bg-[#161616] flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-widest text-[#f5f5f5] text-xs font-mono">Purchase Orders</h3>
            <span className="text-[10px] font-mono text-zinc-500">{pos.length} total</span>
         </div>
         <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap text-zinc-300">
              <thead className="bg-[#0a0a0a] text-zinc-500 font-mono text-[10px] uppercase tracking-widest border-b border-[#222]">
                <tr>
                  <th className="p-4 font-normal">PO Number</th>
                  <th className="p-4 font-normal">Supplier</th>
                  <th className="p-4 font-normal">Items</th>
                  <th className="p-4 font-normal text-right">Total (KES)</th>
                  <th className="p-4 font-normal text-center">Status</th>
                  <th className="p-4 font-normal text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222] font-mono text-xs">
                 {pos.map(po => (
                   <tr key={po.id} className="hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
                      <td className="p-4 font-bold text-amber-500">{po.id}</td>
                      <td className="p-4 text-white font-sans text-sm">{po.supplier_name}</td>
                      <td className="p-4 text-zinc-400">{po.items} <span className="text-zinc-600">({po.item_detail})</span></td>
                      <td className="p-4 text-right text-zinc-300">{Number(po.total).toLocaleString()}</td>
                      <td className="p-4 text-center">
                         <span className={`${poStatusColors[po.status] || ''} border px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-widest`}>{po.status}</span>
                      </td>
                      <td className="p-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                           {po.status !== 'RECEIVED' ? (
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleReceivePO(po.id); }}
                               disabled={receivingId === po.id}
                               className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-500 rounded flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                             >
                               <CheckCircle className="w-3 h-3" /> {receivingId === po.id ? '...' : 'RECEIVE'}
                             </button>
                           ) : (
                             <span className="text-zinc-600 text-[10px] px-3 py-1">VERIFIED</span>
                           )}
                           <button onClick={(e) => { e.stopPropagation(); handleDeletePO(po.id); }} className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-900/20 rounded transition">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                      </td>
                   </tr>
                 ))}
                 {pos.length === 0 && (
                   <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No purchase orders.</td></tr>
                 )}
              </tbody>
            </table>
         </div>
      </div>

      {/* Create PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center" onClick={() => setShowPOModal(false)}>
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">New Purchase Order</h3>
              <button onClick={() => setShowPOModal(false)} className="text-zinc-500 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Supplier</label>
                <select 
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-amber-500"
                  value={poForm.supplier_id}
                  onChange={e => setPOForm({...poForm, supplier_id: e.target.value})}
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">SKU ID</label>
                <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-amber-500 font-mono"
                  placeholder="e.g. SKU-RS-NV" value={poForm.items} onChange={e => setPOForm({...poForm, items: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Quantity Detail</label>
                <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-amber-500 font-mono"
                  placeholder="e.g. 2000 pcs" value={poForm.item_detail} onChange={e => setPOForm({...poForm, item_detail: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Total (KES)</label>
                <input type="number" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-amber-500 font-mono"
                  placeholder="e.g. 70000" value={poForm.total} onChange={e => setPOForm({...poForm, total: e.target.value})} />
              </div>
            </div>
            
            <button 
              onClick={handleCreatePO} 
              disabled={saving || !poForm.supplier_id || !poForm.items || !poForm.total}
              className="w-full mt-6 py-3 bg-amber-500 text-black font-bold rounded text-sm hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'CREATING...' : 'CREATE PURCHASE ORDER'}
            </button>
          </div>
        </div>
      )}

      {/* Send SMS Modal */}
      {showSMSModal && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center" onClick={() => setShowSMSModal(false)}>
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-500" /> Message Supplier
              </h3>
              <button onClick={() => setShowSMSModal(false)} className="text-zinc-500 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">To</label>
                <div className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-zinc-300 font-mono">
                  {smsForm.name} ({smsForm.phone})
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Message</label>
                <textarea 
                  rows={4}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 font-mono resize-none text-zinc-200"
                  placeholder="Type your message here..." 
                  value={smsForm.text} 
                  onChange={e => setSmsForm({...smsForm, text: e.target.value})} 
                />
              </div>
            </div>
            
            <button 
              onClick={handleSendSMS} 
              disabled={sendingSMS || !smsForm.text}
              className="w-full mt-6 py-3 bg-emerald-600 text-white font-bold rounded text-sm hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingSMS ? 'SENDING...' : 'SEND SMS'}
            </button>
          </div>
        </div>
      )}
      {/* Supplier Modal (Create/Edit) */}
      {(showSupplierModal || editSupplierForm) && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center" onClick={() => { setShowSupplierModal(false); setEditSupplierForm(null); }}>
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{editSupplierForm ? 'Edit Supplier' : 'New Supplier'}</h3>
              <button onClick={() => { setShowSupplierModal(false); setEditSupplierForm(null); }} className="text-zinc-500 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Supplier ID</label>
                <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
                  disabled={!!editSupplierForm} placeholder="e.g. SUP-06" value={editSupplierForm ? editSupplierForm.id : supplierForm.id} 
                  onChange={e => editSupplierForm ? setEditSupplierForm({...editSupplierForm, id: e.target.value}) : setSupplierForm({...supplierForm, id: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Company Name</label>
                <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="e.g. Fresh Farms Ltd" value={editSupplierForm ? editSupplierForm.name : supplierForm.name} 
                  onChange={e => editSupplierForm ? setEditSupplierForm({...editSupplierForm, name: e.target.value}) : setSupplierForm({...supplierForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Location</label>
                  <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="e.g. Naivasha" value={editSupplierForm ? editSupplierForm.location : supplierForm.location} 
                    onChange={e => editSupplierForm ? setEditSupplierForm({...editSupplierForm, location: e.target.value}) : setSupplierForm({...supplierForm, location: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Category</label>
                  <select 
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    value={editSupplierForm ? editSupplierForm.cat : supplierForm.category}
                    onChange={e => editSupplierForm ? setEditSupplierForm({...editSupplierForm, cat: e.target.value}) : setSupplierForm({...supplierForm, category: e.target.value})}
                  >
                    <option>Perishable</option>
                    <option>Dry Store</option>
                    <option>Cold Store</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Phone Number (SMS Ready)</label>
                <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 font-mono"
                  placeholder="+2547..." value={editSupplierForm ? editSupplierForm.phone : supplierForm.phone} 
                  onChange={e => editSupplierForm ? setEditSupplierForm({...editSupplierForm, phone: e.target.value}) : setSupplierForm({...supplierForm, phone: e.target.value})} />
              </div>
            </div>
            
            <button 
              onClick={() => handleSaveSupplier(editSupplierForm ? 'edit' : 'create')} 
              disabled={saving}
              className="w-full mt-6 py-3 bg-white text-black font-bold rounded text-sm hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'SAVING...' : (editSupplierForm ? 'SAVE CHANGES' : 'CREATE SUPPLIER')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
