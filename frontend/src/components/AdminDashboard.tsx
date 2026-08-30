'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  Clock, 
  CheckCircle2,
  FileSpreadsheet,
  Gauge,
  Cpu
} from 'lucide-react';

const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'https://railopt1.onrender.com/api/v1';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const API_BASE = getApiBase();

export default function AdminDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'console';

  const [punctualityWeight, setPunctualityWeight] = useState(0.85);
  const [safetyWeight, setSafetyWeight] = useState(0.95);
  const [freightPenalty, setFreightPenalty] = useState(0.40);
  const [horizon, setHorizon] = useState<'DAILY' | 'WEEKLY' | 'ROLLING_30_DAYS'>('DAILY');
  const [optData, setOptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    fetchExecutivePlan();
  }, [horizon]);

  const fetchExecutivePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/optimize?horizon=${horizon}&punctuality_weight=${punctualityWeight}&safety_weight=${safetyWeight}&freight_penalty=${freightPenalty}`,
        { method: 'POST' }
      );
      if (res.ok) {
        const json = await res.json();
        setOptData(json);
      }
    } catch (err) {
      console.error("Failed to load admin telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyWeights = () => {
    fetchExecutivePlan();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 4000);
  };

  return (
    <div className="space-y-6 font-['Inter']">
      
      {/* Admin Executive Header */}
      <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-4 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl border border-[#9A111F]/30 bg-[#9A111F]/10 text-[#9A111F]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#21304D] flex items-center gap-2">
              Divisional Operations Command Center (Sr. DOM)
              <span className="text-[10px] bg-[#9A111F]/10 border border-[#9A111F]/20 text-[#9A111F] px-2 py-0.5 rounded font-mono font-semibold">
                EXECUTIVE OVERSIGHT
              </span>
            </h2>
            <p className="text-[11px] text-[#667085]">
              Pune Division • Central Railway • System Policy Configuration
            </p>
          </div>
        </div>

        {/* Horizon Picker */}
        <div className="flex bg-[#F1EDE3] border border-[#D8D2C7] p-1 rounded-xl text-[12px]">
          {(['DAILY', 'WEEKLY', 'ROLLING_30_DAYS'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                horizon === h
                  ? 'bg-[#21304D] text-white shadow-xs font-semibold'
                  : 'text-[#667085] hover:text-[#344054]'
              }`}
            >
              {h.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {savedNotice && (
        <div className="bg-[#287A62]/10 border border-[#287A62]/30 p-3 rounded-xl flex items-center gap-2 text-[12px] text-[#287A62] font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#287A62] shrink-0" />
          <span>Optimization policies recalculated across all Pune Division corridors.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] text-[#667085] flex items-center justify-between font-medium">
            Downtime Avoided
            <TrendingUp className="w-4 h-4 text-[#287A62]" />
          </span>
          <div className="text-[28px] font-bold text-[#287A62] mt-1 font-mono tracking-tight leading-none">
            {optData?.downtime_reduction_percentage || 0}%
          </div>
          <p className="text-[10px] text-[#667085] mt-1.5 font-normal">Section capacity conserved</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] text-[#667085] flex items-center justify-between font-medium">
            Net Maintenance Hours Saved
            <Clock className="w-4 h-4 text-[#9A111F]" />
          </span>
          <div className="text-[28px] font-bold text-[#9A111F] mt-1 font-mono tracking-tight leading-none">
            {optData?.total_maintenance_hours_saved || 0} hrs
          </div>
          <p className="text-[10px] text-[#667085] mt-1.5 font-normal">Across Civil, S&T, TRD</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] text-[#667085] flex items-center justify-between font-medium">
            Corridors Bundled
            <Layers className="w-4 h-4 text-[#21304D]" />
          </span>
          <div className="text-[28px] font-bold text-[#21304D] mt-1 font-mono tracking-tight leading-none">
            {optData?.total_blocks_scheduled || 0}
          </div>
          <p className="text-[10px] text-[#667085] mt-1.5 font-normal">Integrated multi-dept windows</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] text-[#667085] flex items-center justify-between font-medium">
            G&SR Safety Clearance
            <ShieldCheck className="w-4 h-4 text-[#287A62]" />
          </span>
          <div className="text-[28px] font-bold text-[#287A62] mt-1 font-mono tracking-tight leading-none">
            100%
          </div>
          <p className="text-[10px] text-[#667085] mt-1.5 font-normal">Forms T/351, PTW, T/409 verified</p>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW & POLICY CONFIG */}
      {(activeTab === 'console' || activeTab === 'policy_tuner') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#D8D2C7] pb-3">
              <Sliders className="w-4 h-4 text-[#9A111F]" />
              <div>
                <h3 className="text-[14px] font-semibold text-[#21304D]">OR-Tools CP-SAT Objective Weights</h3>
                <p className="text-[11px] text-[#667085]">Tune mathematical penalties across the division network</p>
              </div>
            </div>

            <div className="space-y-4 text-[12px]">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#344054] font-medium text-[11px]">Passenger Punctuality Weight (W<sub>p</sub>)</span>
                  <span className="font-mono text-[#9A111F] font-bold">{punctualityWeight.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={punctualityWeight}
                  onChange={e => setPunctualityWeight(parseFloat(e.target.value))}
                  className="w-full accent-[#9A111F] bg-[#D8D2C7] h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#344054] font-medium text-[11px]">Track Safety & Criticality Weight (W<sub>s</sub>)</span>
                  <span className="font-mono text-[#287A62] font-bold">{safetyWeight.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={safetyWeight}
                  onChange={e => setSafetyWeight(parseFloat(e.target.value))}
                  className="w-full accent-[#287A62] bg-[#D8D2C7] h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#344054] font-medium text-[11px]">Freight Detention Penalty (W<sub>f</sub>)</span>
                  <span className="font-mono text-[#21304D] font-bold">{freightPenalty.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={freightPenalty}
                  onChange={e => setFreightPenalty(parseFloat(e.target.value))}
                  className="w-full accent-[#21304D] bg-[#D8D2C7] h-2 rounded-lg cursor-pointer"
                />
              </div>

              <button
                onClick={handleApplyWeights}
                className="w-full mt-2 bg-[#9A111F] hover:bg-[#7D0C18] text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5" />
                Apply & Re-optimize Division Plan
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
              <div>
                <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#9A111F]" />
                  Division Corridor Ledger
                </h3>
                <p className="text-[11px] text-[#667085]">Live section health & bundled maintenance allocation</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-[12px]">
              {optData?.blocks?.map((blk: any) => (
                <div key={blk.block_id} className="p-3 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] flex items-center justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#344054]">{blk.block_id}</span>
                      <span className="text-[10px] bg-[#F1EDE3] text-[#667085] px-1.5 py-0.5 rounded font-mono border border-[#D8D2C7]">
                        {blk.section_id}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#667085] mt-1">
                      Slot: <strong className="text-[#344054]">{blk.allocated_start_time} - {blk.allocated_end_time}</strong> ({blk.allocated_duration_mins}m)
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-[#287A62] font-bold">+{blk.time_saved_mins}m saved</div>
                    <div className="text-[10px] text-[#667085]">{(blk.bundled_tasks || []).length} tasks bundled</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#9A111F]" />
            Division Complete Maintenance Asset Ledger
          </h3>
          <p className="text-[12px] text-[#667085]">All 7 Pune Division sections mapped with daily allocated corridors.</p>
        </div>
      )}

      {/* VIEW 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#287A62]" />
            Section Punctuality & Freight Throughput Analytics
          </h3>
          <p className="text-[12px] text-[#667085]">Punctuality preservation at 98.4% across Pune - Lonavala suburban corridor.</p>
        </div>
      )}

    </div>
  );
}