'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Train, Lock, Mail, ShieldAlert, KeyRound } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('controller.pune@cr.railnet.gov.in');
  const [password, setPassword] = useState('Railways@2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Authentication failed');
      }

      const data = await res.json();
      login(data.access_token, data.user, data.redirect_url);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickSwitch = (officialEmail: string) => {
    setEmail(officialEmail);
    setPassword('Railways@2026');
  };

  return (
    <div className="min-h-screen bg-[#F1EDE3] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-['Inter']">
      
      {/* Ministry Portal Header */}
      <div className="max-w-md w-full text-center space-y-2 mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-[#9A111F]/10 border border-[#9A111F]/20 text-[#9A111F] mb-1">
          <Train className="w-8 h-8" />
        </div>
        <h1 className="text-[18px] font-bold text-[#21304D] tracking-tight">RailBlock-AI Enterprise Gateway</h1>
        <p className="text-[11px] font-normal text-[#667085]">
          Ministry of Railways • Center for Railway Information Systems (CRIS)
        </p>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-2xl p-6 shadow-xs backdrop-blur-md">
        
        {error && (
          <div className="mb-4 bg-[#9A111F]/10 border border-[#9A111F]/30 p-3 rounded-xl flex items-center gap-2.5 text-[12px] text-[#9A111F] font-medium">
            <ShieldAlert className="w-4 h-4 text-[#9A111F] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#344054] font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#667085]" />
              RailNet Official Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-xl px-3.5 py-2.5 text-[12px] text-[#344054] placeholder-[#9E8B8E] focus:outline-none focus:border-[#9A111F] focus:ring-1 focus:ring-[#9A111F] transition-all"
              placeholder="name.dept@cr.railnet.gov.in"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[#344054] font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#667085]" />
              Security Password / HRMS Token
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-xl px-3.5 py-2.5 text-[12px] text-[#344054] placeholder-[#9E8B8E] focus:outline-none focus:border-[#9A111F] focus:ring-1 focus:ring-[#9A111F] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#9A111F] hover:bg-[#7D0C18] text-white font-semibold text-[13px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            {loading ? 'Authenticating with CRIS Bus...' : 'Secure System Login'}
          </button>
        </form>

        {/* 5 Official Role Demo Fillers */}
        <div className="mt-6 pt-4 border-t border-[#D8D2C7]">
          <p className="text-[11px] text-[#667085] mb-2 font-medium">Authorized Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button 
              type="button"
              onClick={() => quickSwitch('controller.pune@cr.railnet.gov.in')}
              className="bg-[#FFFFFF] hover:bg-[#F1EDE3] border border-[#D8D2C7] text-[#344054] p-2 rounded-lg text-left transition-all font-medium"
            >
              🎮 <strong>COA Controller</strong>
            </button>
            <button 
              type="button"
              onClick={() => quickSwitch('srdom.pune@cr.railnet.gov.in')}
              className="bg-[#FFFFFF] hover:bg-[#F1EDE3] border border-[#D8D2C7] text-[#344054] p-2 rounded-lg text-left transition-all font-medium"
            >
              🏛️ <strong>Sr. DOM Admin</strong>
            </button>
            <button 
              type="button"
              onClick={() => quickSwitch('rajesh.civil@cr.railnet.gov.in')}
              className="bg-[#FFFFFF] hover:bg-[#F1EDE3] border border-[#D8D2C7] text-[#344054] p-2 rounded-lg text-left transition-all font-medium"
            >
              🛡️ <strong>SSE / Civil</strong>
            </button>
            <button 
              type="button"
              onClick={() => quickSwitch('amit.snt@cr.railnet.gov.in')}
              className="bg-[#FFFFFF] hover:bg-[#F1EDE3] border border-[#D8D2C7] text-[#344054] p-2 rounded-lg text-left transition-all font-medium"
            >
              📡 <strong>SSE / S&T</strong>
            </button>
            <button 
              type="button"
              onClick={() => quickSwitch('pooja.trd@cr.railnet.gov.in')}
              className="col-span-2 bg-[#FFFFFF] hover:bg-[#F1EDE3] border border-[#D8D2C7] text-[#344054] p-2 rounded-lg text-left transition-all font-medium"
            >
              ⚡ <strong>SSE / TRD</strong>
            </button>
          </div>
        </div>

      </div>

      <div className="mt-6 text-[10px] text-[#667085] font-mono">
        Secured by CRIS GovPKI • 256-Bit TLS End-to-End Encryption
      </div>
    </div>
  );
}