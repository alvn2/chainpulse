"use client";

import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Signal, SignalZero, User, Hash } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function DriverGPSPage({ params }: { params: Promise<{ id: string }> }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  
  // Unwrapping params.id in Next 15
  const unwrappedParams = React.use(params);
  const shipmentId = unwrappedParams.id;

  useEffect(() => {
    // Connect to the local Socket.IO server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl);
    
    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to Telematics Engine');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        if (socket && connected) {
          socket.emit('gps_update', {
            shipmentId,
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString()
          });
        }
      },
      (err) => {
        setError(`GPS Error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, connected, shipmentId]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <div className="bg-[#111] border-b border-[#222] p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-500/30">
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Driver Portal</div>
            <div className="font-bold tracking-tight">{shipmentId}</div>
          </div>
        </div>
        <div>
          {connected ? (
            <div className="flex items-center text-emerald-400 text-xs gap-1.5 border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 rounded">
              <Signal className="w-3 h-3" /> LIVE
            </div>
          ) : (
            <div className="flex items-center text-red-400 text-xs gap-1.5 border border-red-900/50 bg-red-950/30 px-2 py-1 rounded">
              <SignalZero className="w-3 h-3" /> OFFLINE
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full gap-6">
        
        <div className="bg-[#111] border border-[#222] rounded-xl p-5 shadow-2xl">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#222] pb-3">
            <MapPin className="w-4 h-4 text-emerald-500" /> GPS Telemetry
          </h2>
          
          {error ? (
            <div className="text-red-400 text-xs p-3 bg-red-950/20 border border-red-900/30 rounded">
              {error}
            </div>
          ) : location ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black border border-[#333] p-3 rounded flex flex-col">
                <span className="text-[10px] text-zinc-600 mb-1">LATITUDE</span>
                <span className="text-emerald-400 text-lg">{location.lat.toFixed(6)}</span>
              </div>
              <div className="bg-black border border-[#333] p-3 rounded flex flex-col">
                <span className="text-[10px] text-zinc-600 mb-1">LONGITUDE</span>
                <span className="text-emerald-400 text-lg">{location.lng.toFixed(6)}</span>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-xs text-center p-4">Acquiring satellite lock...</div>
          )}
        </div>

        <div className="bg-[#111] border border-[#222] rounded-xl p-5 shadow-2xl">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#222] pb-3">
            <Hash className="w-4 h-4 text-blue-500" /> Protocol Instructions
          </h2>
          <div className="text-xs text-zinc-400 space-y-3 leading-relaxed">
            <p>1. Keep this page open in your browser while driving. Your GPS coordinates are securely streamed to HQ.</p>
            <p>2. If you enter a zero-internet zone, SMS commands will still work.</p>
            <div className="bg-black p-3 border border-[#333] rounded mt-2 text-[10px]">
              <div className="text-zinc-500 mb-1">Report Temperature:</div>
              <code className="text-blue-400">TEMP [value] {shipmentId}</code>
              <div className="text-zinc-500 mt-2 mb-1">Report Delivery:</div>
              <code className="text-emerald-400">STATUS DELIVER {shipmentId}</code>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 text-center text-[10px] text-zinc-600">
        ChainPulse Driver Terminal v1.0
      </div>
    </div>
  );
}
