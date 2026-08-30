'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Zap, 
  Radio, 
  AlertTriangle, 
  X, 
  Printer, 
  CheckCircle2 
} from 'lucide-react';

const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'https://railopt1.onrender.com/api/v1';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const API_BASE = getApiBase();

interface Props {
  blockId: string;
  onClose: () => void;
}

export default function SafetyDossierModal({ blockId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [dossierData, setDossierData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'T351' | 'TRD_PTW' | 'T409'>('T351');

  useEffect(() => {
    fetchDossier();
  }, [blockId]);

  const fetchDossier = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/blocks/${blockId}/safety-dossier`);
      if (res.ok) {
        const json = await res.json();
        setDossierData(json);
      }
    } catch (err) {
      console.error("Failed to load dossier:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#FAF7F2] border border-[#E2D7C8] p-6 rounded-2xl text-[#2B1518] text-sm flex items-center gap-3 shadow-xl">
          <div className="w-4 h-4 border-2 border-[#90323D] border-t-transparent rounded-full animate-spin" />
          Fetching G&SR statutory safety forms for {blockId}...
        </div>
      </div>
    );
  }

  const dossier = dossierData?.dossier;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-['Inter']">
      <div className="bg-[#FFFFFF] border border-[#D8D2C7] rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#D8D2C7] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#9A111F]" />
            <div>
              <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
                Statutory Safety Dossier
                <span className="text-[10px] bg-[#F1EDE3] text-[#9A111F] px-2 py-0.5 rounded border border-[#D8D2C7] font-mono font-medium">
                  {blockId}
                </span>
              </h3>
              <p className="text-[11px] text-[#667085]">Compliance: Indian Railways General & Subsidiary Rules (G&SR)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#667085] hover:text-[#344054] p-1 rounded-lg hover:bg-[#F1EDE3] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#D8D2C7] bg-[#FFFFFF] px-6 pt-2 gap-2 text-[12px]">
          <button
            onClick={() => setActiveTab('T351')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all ${
              activeTab === 'T351'
                ? 'border-[#9A111F] text-[#9A111F] font-semibold'
                : 'border-transparent text-[#667085] hover:text-[#344054]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Form S&T (T/351)
          </button>
          <button
            onClick={() => setActiveTab('TRD_PTW')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all ${
              activeTab === 'TRD_PTW'
                ? 'border-[#9A111F] text-[#9A111F] font-semibold'
                : 'border-transparent text-[#667085] hover:text-[#344054]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            TRD Power PTW
          </button>
          <button
            onClick={() => setActiveTab('T409')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all ${
              activeTab === 'T409'
                ? 'border-[#9A111F] text-[#9A111F] font-semibold'
                : 'border-transparent text-[#667085] hover:text-[#344054]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Caution Order (T/409)
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-[12px]">
          
          {/* TAB 1: FORM T/351 */}
          {activeTab === 'T351' && dossier?.form_snt_t351 && (
            <div className="space-y-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#D8D2C7] shadow-xs">
              <div className="border-b border-[#D8D2C7] pb-2 flex justify-between items-center">
                <span className="font-mono font-bold text-[#9A111F]">{dossier.form_snt_t351.title}</span>
                <span className="text-[10px] bg-[#9A111F]/10 text-[#9A111F] border border-[#9A111F]/20 px-2 py-0.5 rounded font-semibold">
                  {dossier.form_snt_t351.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[#667085]">
                <div>Section: <strong className="text-[#344054]">{dossier.form_snt_t351.section_id} ({dossier.form_snt_t351.track_line})</strong></div>
                <div>KM Span: <strong className="text-[#344054] font-mono">{dossier.form_snt_t351.km_span}</strong></div>
                <div>SSE Sign-off: <strong className="text-[#344054]">{dossier.form_snt_t351.sse_signoff}</strong></div>
                <div>Controller Ack: <strong className="text-[#344054]">{dossier.form_snt_t351.controller_acknowledgement}</strong></div>
              </div>
              <div>
                <span className="text-[#667085] block mb-1">Gears Isolated / Disconnected:</span>
                <div className="flex gap-1.5">
                  {dossier.form_snt_t351.gears_isolated.map((g: string) => (
                    <span key={g} className="bg-[#F1EDE3] border border-[#D8D2C7] px-2 py-1 rounded text-[#344054] font-mono text-[11px]">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-[#9A111F] italic bg-[#9A111F]/10 p-2.5 rounded-lg border border-[#9A111F]/20 font-medium">
                ⚠️ {dossier.form_snt_t351.legal_notice}
              </p>
            </div>
          )}

          {/* TAB 2: TRD POWER PTW */}
          {activeTab === 'TRD_PTW' && dossier?.trd_power_ptw && (
            <div className="space-y-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#D8D2C7] shadow-xs">
              <div className="border-b border-[#D8D2C7] pb-2 flex justify-between items-center">
                <span className="font-mono font-bold text-[#9A111F]">{dossier.trd_power_ptw.title}</span>
                <span className="text-[10px] bg-[#9A111F]/10 text-[#9A111F] border border-[#9A111F]/20 px-2 py-0.5 rounded font-semibold">
                  {dossier.trd_power_ptw.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[#667085]">
                <div>Elementary Section: <strong className="text-[#344054] font-mono">{dossier.trd_power_ptw.elementary_section_id}</strong></div>
                <div>Feeding Post: <strong className="text-[#344054] font-mono">{dossier.trd_power_ptw.feeding_post}</strong></div>
                <div>Voltage Isolated: <strong className="text-[#344054] font-mono">{dossier.trd_power_ptw.voltage_isolated_kv} kV AC</strong></div>
                <div>TSO Token: <strong className="text-[#344054] font-mono">{dossier.trd_power_ptw.tso_controller_token}</strong></div>
              </div>
              <div>
                <span className="text-[#667085] block mb-1">Earth Discharge Rods Verified:</span>
                <div className="flex gap-1.5">
                  {dossier.trd_power_ptw.earth_discharge_rods_planted.map((rod: string) => (
                    <span key={rod} className="bg-[#F1EDE3] border border-[#D8D2C7] px-2 py-1 rounded text-[#287A62] font-mono text-[11px] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-[#287A62]" />
                      {rod}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAUTION ORDER T/409 */}
          {activeTab === 'T409' && dossier?.caution_order_t409 && (
            <div className="space-y-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#D8D2C7] shadow-xs">
              <div className="border-b border-[#D8D2C7] pb-2 flex justify-between items-center">
                <span className="font-mono font-bold text-[#9A111F]">{dossier.caution_order_t409.title}</span>
                <span className="text-[10px] bg-[#9A111F]/10 text-[#9A111F] border border-[#9A111F]/20 px-2 py-0.5 rounded font-semibold">
                  {dossier.caution_order_t409.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[#667085]">
                <div>Restriction Zone: <strong className="text-[#344054] font-mono">{dossier.caution_order_t409.speed_restriction_zone}</strong></div>
                <div>Speed Limit: <strong className="text-[#9A111F] font-mono text-[13px]">{dossier.caution_order_t409.max_allowable_speed_kmh} km/h</strong> (Normal: {dossier.caution_order_t409.normal_sectional_speed_kmh} km/h)</div>
                <div>Cause: <strong className="text-[#344054] font-mono">{dossier.caution_order_t409.reason_for_restriction}</strong></div>
                <div>Issued By: <strong className="text-[#344054]">{dossier.caution_order_t409.issued_by}</strong></div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#D8D2C7] flex items-center justify-between bg-[#FFFFFF]">
          <span className="text-[11px] text-[#667085] font-mono">
            Cryptographically Signed & Timestamped
          </span>
          <button 
            onClick={() => window.print()}
            className="bg-[#9A111F] hover:bg-[#7D0C18] text-white text-[12px] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Statutory Form
          </button>
        </div>

      </div>
    </div>
  );
}