'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldAlert, 
  Radio, 
  Zap, 
  Send, 
  Clock, 
  CheckCircle2, 
  Play, 
  FileCheck2, 
  Cpu, 
  Truck, 
  Flame, 
  ShieldCheck, 
  Activity, 
  Gauge, 
  FileSpreadsheet,
  AlertTriangle,
  Wrench,
  RadioTower
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function EngineerDashboard() {
  const { user } = useAuth();
  const { t } = useUI();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'console';

  const department = user?.department || 'TRD';
  const designation = user?.designation || `Senior Section Engineer (${department})`;

  const [defects, setDefects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionId, setSectionId] = useState('KNHE-LNL');
  const [trackLine, setTrackLine] = useState('UP_MAIN');
  const [startKm, setStartKm] = useState('52.0');
  const [endKm, setEndKm] = useState('54.5');
  const [durationMins, setDurationMins] = useState('120');
  const [equipment, setEquipment] = useState('OHE_TOWER_WAGON_4W');
  const [postTsr, setPostTsr] = useState('30');
  const [pointId, setPointId] = useState('PT-104A');
  const [elementarySection, setElementarySection] = useState('ES-LNL-UP-04');
  const [reqNotice, setReqNotice] = useState<string | null>(null);

  const [workState, setWorkState] = useState<'IDLE' | 'IN_PROGRESS' | 'COMPLETED'>('IDLE');
  const [workTimer, setWorkTimer] = useState(0);

  const [earthRods] = useState([
    { id: 'ER-01', location: 'KM 52/12', appliedBy: 'Pooja Verma (SSE)', verified: true, time: '01:15' },
    { id: 'ER-02', location: 'KM 54/20', appliedBy: 'S. Kumar (Tech-I)', verified: true, time: '01:18' },
    { id: 'ER-03', location: 'KM 53/04', appliedBy: 'A. R. Patil (JE/TRD)', verified: true, time: '01:22' },
  ]);

  useEffect(() => {
    fetchLiveDefects();
  }, [department]);

  useEffect(() => {
    let interval: any;
    if (workState === 'IN_PROGRESS') {
      interval = setInterval(() => setWorkTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [workState]);

  const fetchLiveDefects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/defects?department=${department}`);
      if (res.ok) {
        const json = await res.json();
        setDefects(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load department defects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequisitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const queryParams = new URLSearchParams({
        department: department,
        section_id: sectionId,
        track_line: trackLine,
        start_km: startKm,
        end_km: endKm,
        duration_mins: durationMins,
        equipment: equipment,
        post_tsr: postTsr
      });

      const res = await fetch(`${API_BASE}/requisitions?${queryParams.toString()}`, {
        method: 'POST'
      });

      if (res.ok) {
        setReqNotice(`BDMS Requisition successfully lodged into Pune COA Engine for Section ${sectionId}.`);
        fetchLiveDefects();
        setTimeout(() => setReqNotice(null), 5000);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const getDeptColor = () => {
    switch (department) {
      case 'CIVIL': return 'text-[#287A62] bg-[#287A62]/10 border-[#287A62]/20';
      case 'SNT': return 'text-[#21304D] bg-[#21304D]/10 border-[#21304D]/20';
      case 'TRD': return 'text-[#9A111F] bg-[#9A111F]/10 border-[#9A111F]/20';
      default: return 'text-[#9A111F] bg-[#9A111F]/10 border-[#9A111F]/20';
    }
  };

  const getDeptIcon = () => {
    switch (department) {
      case 'CIVIL': return <ShieldAlert className="w-5 h-5 text-[#287A62]" />;
      case 'SNT': return <Radio className="w-5 h-5 text-[#21304D]" />;
      case 'TRD': return <Zap className="w-5 h-5 text-[#9A111F]" />;
      default: return <Cpu className="w-5 h-5 text-[#9A111F]" />;
    }
  };

  return (
    <div className="space-y-6 font-['Inter']">

      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-4 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${getDeptColor()}`}>
            {getDeptIcon()}
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#21304D] flex items-center gap-2">
              {department === 'CIVIL' && 'Track & Civil Portal (P-Way)'}
              {department === 'SNT' && 'Signal & Telecom Portal (S&T)'}
              {department === 'TRD' && 'Traction / 25kV OHE Portal (TRD)'}
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${getDeptColor()}`}>
                SSE DESK
              </span>
            </h2>
            <p className="text-[11px] text-[#667085]">{designation} • Pune Division</p>
          </div>
        </div>

        {/* Live Field Protocol */}
        <div className="flex items-center gap-2">
          {workState === 'IDLE' && (
            <button
              onClick={() => setWorkState('IN_PROGRESS')}
              className="bg-[#9A111F] hover:bg-[#7D0C18] text-white text-[12px] font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              {t('commence_field_work')}
            </button>
          )}

          {workState === 'IN_PROGRESS' && (
            <div className="flex items-center gap-3 bg-[#FFFFFF] border border-[#287A62]/40 px-3 py-1.5 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5 text-[12px] text-[#287A62] font-mono font-bold">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Elapsed: {Math.floor(workTimer / 60)}m {workTimer % 60}s</span>
              </div>
              <button
                onClick={() => setWorkState('COMPLETED')}
                className="bg-[#287A62] hover:bg-[#1E5C4A] text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
              >
                Track Fit & Clear
              </button>
            </div>
          )}

          {workState === 'COMPLETED' && (
            <div className="bg-[#FFFFFF] border border-[#D8D2C7] text-[#344054] text-[12px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#287A62]" />
              <span>Block Restored</span>
            </div>
          )}
        </div>
      </div>

      {reqNotice && (
        <div className="bg-[#287A62]/10 border border-[#287A62]/30 p-3 rounded-xl flex items-center gap-2.5 text-[12px] text-[#287A62] font-semibold">
          <FileCheck2 className="w-4 h-4 text-[#287A62] shrink-0" />
          <span>{reqNotice}</span>
        </div>
      )}

      {/* VIEW 1: DEFAULT DEMAND & DEFECTS CONSOLE */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
            <div className="border-b border-[#D8D2C7] pb-3">
              <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#9A111F]" />
                {t('submit_block_demand')}
              </h3>
              <p className="text-[11px] text-[#667085]">Standard CRIS e-Requisition Pipeline for {department}</p>
            </div>

            <form onSubmit={handleRequisitionSubmit} className="space-y-4 text-[12px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#667085] mb-1 block font-medium text-[11px]">{t('section')}</label>
                  <select 
                    value={sectionId} 
                    onChange={e => setSectionId(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-xl p-2 text-[#344054] focus:outline-none focus:border-[#9A111F]"
                  >
                    <option value="KNHE-LNL">Kanhe - Lonavala</option>
                    <option value="TGN-KNHE">Talegaon - Kanhe</option>
                    <option value="CCH-TGN">Chinchwad - Talegaon</option>
                    <option value="DAPD-CCH">Dapodi - Chinchwad</option>
                    <option value="PUNE-SVJR">Pune - Shivajinagar</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#667085] mb-1 block font-medium text-[11px]">{t('track_line')}</label>
                  <select 
                    value={trackLine} 
                    onChange={e => setTrackLine(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-xl p-2 text-[#344054] focus:outline-none focus:border-[#9A111F]"
                  >
                    <option value="UP_MAIN">UP Main Line</option>
                    <option value="DOWN_MAIN">DOWN Main Line</option>
                    <option value="LOOP_LINE">Loop Line</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#667085] mb-1 block font-medium text-[11px]">{t('start_km')}</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={startKm} 
                    onChange={e => setStartKm(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-xl p-2 text-[#344054] font-mono focus:outline-none focus:border-[#9A111F]"
                  />
                </div>

                <div>
                  <label className="text-[#667085] mb-1 block font-medium text-[11px]">{t('end_km')}</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={endKm} 
                    onChange={e => setEndKm(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-xl p-2 text-[#344054] font-mono focus:outline-none focus:border-[#9A111F]"
                  />
                </div>

                <div>
                  <label className="text-[#667085] mb-1 block font-medium text-[11px]">{t('duration_mins')}</label>
                  <input 
                    type="number" 
                    value={durationMins} 
                    onChange={e => setDurationMins(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-xl p-2 text-[#344054] font-mono focus:outline-none focus:border-[#9A111F]"
                  />
                </div>
              </div>

              {department === 'CIVIL' && (
                <div className="p-3 bg-[#F1EDE3]/50 rounded-xl border border-[#D8D2C7] space-y-3">
                  <span className="text-[11px] font-semibold text-[#287A62] block">Track Infrastructure Details</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#667085] mb-1 block text-[11px]">Heavy Plant Needed</label>
                      <select 
                        value={equipment} 
                        onChange={e => setEquipment(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-lg p-1.5 text-[#344054] text-[11px]"
                      >
                        <option value="CSM_TAMPING_MACHINE">CSM Tamping Machine</option>
                        <option value="BCM_SCREENER">BCM Ballast Screener</option>
                        <option value="UNIMAT_TURNOUT">Unimat Turnout Tamper</option>
                        <option value="MANUAL_GANG">Manual Track Gang</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[#667085] mb-1 block text-[11px]">Speed Restriction (TSR km/h)</label>
                      <input 
                        type="number" 
                        value={postTsr} 
                        onChange={e => setPostTsr(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-lg p-1.5 text-[#344054] text-[11px] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {department === 'SNT' && (
                <div className="p-3 bg-[#F1EDE3]/50 rounded-xl border border-[#D8D2C7] space-y-3">
                  <span className="text-[11px] font-semibold text-[#21304D] block">Signal Interlocking Details</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#667085] mb-1 block text-[11px]">Gear / Point ID</label>
                      <input 
                        type="text" 
                        value={pointId} 
                        onChange={e => setPointId(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-lg p-1.5 text-[#344054] text-[11px] font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <input type="checkbox" defaultChecked className="accent-[#21304D]" />
                      <span className="text-[11px] text-[#344054]">Form S&T (T/351) Required</span>
                    </div>
                  </div>
                </div>
              )}

              {department === 'TRD' && (
                <div className="p-3 bg-[#F1EDE3]/50 rounded-xl border border-[#D8D2C7] space-y-3">
                  <span className="text-[11px] font-semibold text-[#9A111F] block">25kV OHE Isolation Setup</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#667085] mb-1 block text-[11px]">Elementary Section ID</label>
                      <input 
                        type="text" 
                        value={elementarySection} 
                        onChange={e => setElementarySection(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-lg p-1.5 text-[#344054] text-[11px] font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <input type="checkbox" defaultChecked className="accent-[#9A111F]" />
                      <span className="text-[11px] text-[#344054]">OHE Power Block (PTW)</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#9A111F] hover:bg-[#7D0C18] text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Lodge Formal Requisition
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9A111F]" />
                Telemetry Defect Feed ({department})
              </h3>
              <span className="text-[11px] text-[#9A111F] bg-[#F1EDE3] px-2 py-0.5 rounded-md font-mono border border-[#D8D2C7] font-medium">
                {defects.length} Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {loading ? (
                <div className="p-8 text-center text-[#667085] text-[12px]">Connecting to Neon PostgreSQL...</div>
              ) : defects.length === 0 ? (
                <div className="p-8 text-center text-[#667085] text-[12px]">No pending defects for this corridor.</div>
              ) : (
                defects.map((d) => (
                  <div key={d.defect_id} className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#D8D2C7] hover:border-[#9A111F]/50 transition-all space-y-1.5 text-[12px] shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#344054]">{d.defect_id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        d.severity === 'CRITICAL' ? 'bg-[#9A111F]/10 text-[#9A111F] border border-[#9A111F]/30' :
                        d.severity === 'URGENT' ? 'bg-[#21304D]/10 text-[#21304D] border border-[#21304D]/30' :
                        'bg-[#F1EDE3] text-[#667085]'
                      }`}>
                        {d.severity}
                      </span>
                    </div>

                    <p className="text-[#344054] text-[12px]">{d.description || d.category}</p>

                    <div className="flex items-center justify-between text-[11px] text-[#667085] pt-1 border-t border-[#D8D2C7] font-mono">
                      <span>KM {d.start_km} - {d.end_km}</span>
                      <span className="text-[#9A111F] font-semibold">{d.required_duration_mins} mins needed</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TRD SUB-VIEWS */}
      {activeTab === 'elementary_sections' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <div>
              <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#9A111F]" />
                Pune Division 25kV AC Elementary Feeding Isolation Matrix
              </h3>
              <p className="text-[11px] text-[#667085]">Isolator switch registry and feeding post jurisdictions</p>
            </div>
            <span className="text-[10px] bg-[#287A62]/10 text-[#287A62] border border-[#287A62]/20 px-2 py-0.5 rounded-md font-mono font-bold">
              TPC SCADA LINKED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px]">
            {[
              { id: 'ES-LNL-UP-04', section: 'Kanhe - Lonavala', line: 'UP Main', isolator: 'ISO-524/1', voltage: '25.4 kV' },
              { id: 'ES-TGN-DN-02', section: 'Talegaon - Kanhe', line: 'DOWN Main', isolator: 'ISO-412/3', voltage: '25.1 kV' },
              { id: 'ES-CCH-UP-01', section: 'Chinchwad - Talegaon', line: 'UP Main', isolator: 'ISO-210/2', voltage: '25.3 kV' },
            ].map((es) => (
              <div key={es.id} className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[#9A111F]">{es.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#F1EDE3] text-[#667085] font-mono">{es.line}</span>
                </div>
                <div className="text-[#344054] font-medium">{es.section}</div>
                <div className="flex justify-between text-[11px] text-[#667085] pt-2 border-t border-[#D8D2C7] font-mono">
                  <span>Switch: {es.isolator}</span>
                  <span className="text-[#287A62] font-bold">{es.voltage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tower_wagon' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <div>
              <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#9A111F]" />
                OHE Tower Wagon & Self-Propelled Plant Inventory
              </h3>
              <p className="text-[11px] text-[#667085]">Traction inspection vehicle deployment & depot assignments</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 shadow-xs">
              <span className="font-mono font-bold text-[#344054]">4W-RU-8041 (4-Wheeler Wagon)</span>
              <p className="text-[#667085]">Deployed at Lonavala Depot for periodic catenary replacement.</p>
              <div className="text-[#287A62] font-mono text-[11px] font-bold">Status: IN-SERVICE (Speed: 75 km/h)</div>
            </div>
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 shadow-xs">
              <span className="font-mono font-bold text-[#344054]">8W-DETC-9022 (8-Wheeler DETC)</span>
              <p className="text-[#667085]">Stationed at Pune Yard for high-speed emergency recovery.</p>
              <div className="text-[#667085] font-mono text-[11px]">Status: STANDBY (Speed: 105 km/h)</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'earth_rods' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9A111F]" />
              G&SR Statutory Discharge Earthing Log
            </h3>
          </div>
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-[#D8D2C7] text-[#667085] font-mono text-[11px]">
                <th className="pb-2">Rod ID</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Supervisor</th>
                <th className="pb-2">Time</th>
                <th className="pb-2">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D2C7]">
              {earthRods.map((rod) => (
                <tr key={rod.id} className="font-mono text-[#344054]">
                  <td className="py-2.5 font-bold text-[#9A111F]">{rod.id}</td>
                  <td className="py-2.5">{rod.location}</td>
                  <td className="py-2.5">{rod.appliedBy}</td>
                  <td className="py-2.5">{rod.time} hrs</td>
                  <td className="py-2.5">
                    <span className="text-[10px] bg-[#287A62]/10 text-[#287A62] border border-[#287A62]/20 px-2 py-0.5 rounded font-bold">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ptw' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#9A111F]" />
              Digital Permit to Work (PTW - TRD 25kV OHE)
            </h3>
          </div>
          <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#D8D2C7] space-y-3 font-mono text-[12px] text-[#344054] shadow-xs">
            <div className="flex justify-between border-b border-[#D8D2C7] pb-2">
              <span className="text-[#667085]">PTW Reference:</span>
              <span className="text-[#287A62] font-bold">PTW/CR-PUNE/2026/089</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Authorized Supervisor:</span>
              <span className="text-[#344054] font-semibold">{user?.name} ({user?.designation})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Elementary Section Isolated:</span>
              <span className="text-[#9A111F] font-bold">ES-LNL-UP-04 (KM 51.5 - 55.0)</span>
            </div>
            <div className="flex justify-between border-t border-[#D8D2C7] pt-2">
              <span className="text-[#667085]">TPC SCADA Token:</span>
              <span className="text-[#9A111F] font-bold">0x7F9A2B44C1</span>
            </div>
          </div>
        </div>
      )}

      {/* CIVIL SUB-VIEWS */}
      {activeTab === 'machinery' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#287A62]" />
              CSM & BCM Heavy Track Plant Deployment
            </h3>
            <span className="text-[11px] bg-[#F1EDE3] text-[#344054] border border-[#D8D2C7] px-2 py-0.5 rounded font-mono">Pune Track Depot</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 shadow-xs">
              <span className="font-mono font-bold text-[#344054]">CSM-09-3X (Continuous Tamping Machine)</span>
              <p className="text-[#667085]">Assigned for UP Main high-speed alignment KM 52.0 to 54.5.</p>
              <div className="text-[#287A62] font-mono text-[11px] font-bold">Speed: 40 km/h | Status: ASSIGNED</div>
            </div>
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 shadow-xs">
              <span className="font-mono font-bold text-[#344054]">BCM-RM-80 (Ballast Cleaning Machine)</span>
              <p className="text-[#667085]">Scheduled for deep shoulder screening on Kanhe-Lonavala section.</p>
              <div className="text-[#667085] font-mono text-[11px]">Speed: 30 km/h | Status: STANDBY</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usfd_flaws' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#9A111F]" />
              USFD Ultrasonic Rail Flaw Defect Registry
            </h3>
          </div>
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 text-[12px] shadow-xs">
            <div className="flex justify-between font-mono text-[#344054]">
              <span className="font-bold text-[#9A111F]">FLAW-USFD-048</span>
              <span>KM 52.1 - 54.5 (UP MAIN)</span>
              <span className="text-[#9A111F] font-bold">IMR (Immediate Removal)</span>
            </div>
            <p className="text-[#667085]">Transverse flaw detected in head of rail (gauge corner cracking). Requires urgent rail renewal block.</p>
          </div>
        </div>
      )}

      {activeTab === 'tsr_slips' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#9A111F]" />
              TSR Caution Order Register (Form T/409)
            </h3>
          </div>
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 text-[12px] font-mono text-[#344054] shadow-xs">
            <div className="flex justify-between">
              <span className="text-[#667085]">Caution Order:</span>
              <span className="text-[#344054] font-bold">T/409/PUNE/2026/112</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Location:</span>
              <span className="text-[#9A111F] font-bold">KM 52.0 to KM 54.5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Imposed Speed Restriction:</span>
              <span className="text-[#9A111F] font-bold">30 km/h (Post-Work Settling)</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pway_registry' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#287A62]" />
            Permanent Way Asset Inventory (P-Way)
          </h3>
          <p className="text-[12px] text-[#667085]">Section asset logs: 60kg 90UTS Rails, PSC Sleepers (1660/km), Elastic Rail Clips.</p>
        </div>
      )}

      {/* SNT SUB-VIEWS */}
      {activeTab === 'points' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#21304D]" />
              Point Machine Telemetry & Calibration Matrix
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 shadow-xs">
              <div className="flex justify-between font-mono font-bold">
                <span className="text-[#344054]">Point #104A (Lonavala West Yard)</span>
                <span className="text-[#9A111F]">CALIBRATION OVERDUE</span>
              </div>
              <p className="text-[#667085]">Throw Time: 4.8s (Limit: 5.0s) | Motor Current: 3.2A | Friction: HIGH</p>
            </div>
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 shadow-xs">
              <div className="flex justify-between font-mono font-bold">
                <span className="text-[#344054]">Point #108B (Kanhe Entry)</span>
                <span className="text-[#287A62]">HEALTHY</span>
              </div>
              <p className="text-[#667085]">Throw Time: 3.2s | Motor Current: 2.1A | Friction: NORMAL</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'track_circuits' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#21304D]" />
              Track Circuit Voltage & Drop Log
            </h3>
          </div>
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 text-[12px] font-mono text-[#344054] shadow-xs">
            <div className="flex justify-between">
              <span>TC-52/1 (UP MAIN)</span>
              <span>Relay Voltage: 1.85 V</span>
              <span className="text-[#287A62] font-bold">NORMAL (Bal 85%)</span>
            </div>
            <div className="flex justify-between">
              <span>TC-53/4 (UP MAIN)</span>
              <span>Relay Voltage: 1.10 V</span>
              <span className="text-[#9A111F] font-bold">ATTENTION (Low Ballast Resistance)</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 't351' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#21304D]" />
              Statutory Disconnection Memo (Form S&T T/351)
            </h3>
          </div>
          <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#D8D2C7] space-y-3 font-mono text-[12px] text-[#344054] shadow-xs">
            <div className="flex justify-between border-b border-[#D8D2C7] pb-2">
              <span className="text-[#667085]">Memo Reference:</span>
              <span className="text-[#21304D] font-bold">T351/CR-PUNE/2026/044</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Gear Disconnected:</span>
              <span className="text-[#344054]">Point Machine PT-104A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Station Master Acknowledgment:</span>
              <span className="text-[#287A62] font-bold">ACKNOWLEDGED (SM/LNL)</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'axle_counters' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
            <RadioTower className="w-4 h-4 text-[#9A111F]" />
            Digital Axle Counter (DAC) Diagnostics
          </h3>
          <p className="text-[12px] text-[#667085]">High-availability dual-detection block clearing monitors operating stably.</p>
        </div>
      )}

    </div>
  );
}