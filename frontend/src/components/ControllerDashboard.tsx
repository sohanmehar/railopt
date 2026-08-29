'use client';

import React, { useState, useEffect } from 'react';
import { 
  ScheduledBlock, 
  OptimizationResult, 
  TrainScheduleItem 
} from '@/types';
import { useSearchParams } from 'next/navigation';
import DynamicTimeSpaceVisualizer from '@/components/DynamicTimeSpaceVisualizer';
import SafetyDossierModal from '@/components/SafetyDossierModal';
import { 
  Layers, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Zap, 
  Radio, 
  ShieldAlert, 
  FileText, 
  RadioTower,
  FileCheck2
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function ControllerDashboard() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'console';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OptimizationResult | null>(null);
  const [trains, setTrains] = useState<TrainScheduleItem[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<ScheduledBlock | null>(null);
  const [shiftMinute, setShiftMinute] = useState(180);
  const [simResult, setSimResult] = useState<any>(null);
  const [sanctionedIds, setSanctionedIds] = useState<string[]>([]);
  const [activeDossierBlockId, setActiveDossierBlockId] = useState<string | null>(null);
  const [delayNotice, setDelayNotice] = useState<string | null>(null);
  const [delayedTrainNumber, setDelayedTrainNumber] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Reset delay state on fresh calculation / re-run
    setDelayedTrainNumber(null);
    setDelayNotice(null);

    try {
      // 1. Fetch Timetable
      const ttRes = await fetch(`${API_BASE}/timetable`);
      const ttJson = await ttRes.json();
      setTrains(ttJson.data || []);

      // 2. Fetch AI Optimization Plan (CP-SAT powered)
      const optRes = await fetch(`${API_BASE}/optimize?horizon=DAILY`, { method: 'POST' });
      const optJson: OptimizationResult = await optRes.json();
      setData(optJson);
      if (optJson.blocks && optJson.blocks.length > 0) {
        setSelectedBlock(optJson.blocks[0]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

const handleInjectLiveDelay = async () => {
    setLoading(true);
    try {
      // Pass both train_number and delay_minutes
      const res = await fetch(`${API_BASE}/events/train-delay?train_number=22223&delay_minutes=35`, {
        method: 'POST'
      });
      if (res.ok) {
        const json = await res.json();
        const plan = json.rescheduled_plan;
        const delayedNum = json.affected_train?.train_number || '22223';
        const trainName = json.affected_train?.train_name || 'Vande Bharat Express';

        setDelayedTrainNumber(String(delayedNum));

        // Shift train trajectory visually by +35 mins on the SVG chart
        setTrains(prevTrains => 
          prevTrains.map(t => {
            if (String(t.train_number) === String(delayedNum)) {
              return {
                ...t,
                entry_minute_of_day: (t.entry_minute_of_day + 35) % 1440,
                exit_minute_of_day: (t.exit_minute_of_day + 35) % 1440,
              };
            }
            return t;
          })
        );
        
        if (plan && plan.blocks) {
          setData(plan);
          if (plan.blocks.length > 0) {
            setSelectedBlock(plan.blocks[0]);
          }
        }

        setDelayNotice(`Live COA Alert: ${trainName} (#${delayedNum}) delayed +35m. CP-SAT dynamically deconflicted track headways.`);
        setTimeout(() => setDelayNotice(null), 8000);
      } else {
        const errData = await res.json();
        console.error("Delay API responded with error:", errData);
      }
    } catch (err) {
      console.error("Live delay resolution failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (block: ScheduledBlock, newStartMin: number) => {
    setShiftMinute(newStartMin);
    try {
      const res = await fetch(`${API_BASE}/simulate-delay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_id: block.block_id,
          shifted_start_minute: newStartMin,
          duration_mins: block.allocated_duration_mins,
          track_type: block.track_type
        })
      });
      const json = await res.json();
      setSimResult(json);
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  const handleSanction = async (blockId: string) => {
    try {
      const res = await fetch(`${API_BASE}/blocks/${encodeURIComponent(blockId)}/sanction?action=APPROVE`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        setSanctionedIds(prev => [...prev, blockId]);
        setDelayNotice(`Corridor ${blockId} sanctioned. G&SR Safety Dossier & PTW generated.`);
        setTimeout(() => setDelayNotice(null), 6000);
      }
    } catch (err) {
      console.error("Sanction error:", err);
      // Optimistic update for presentation UI
      setSanctionedIds(prev => [...prev, blockId]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-[#6E5A5D] gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-[#90323D]" />
        <span>Syncing TMS, SMMS, TDMS telemetry & running CP-SAT Optimization Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Inter']">

      {delayNotice && (
        <div className="bg-[#9A111F]/10 border border-[#9A111F]/30 p-3 rounded-xl flex items-center gap-3 text-[12px] text-[#9A111F] animate-pulse font-medium">
          <RadioTower className="w-4 h-4 text-[#9A111F] shrink-0" />
          <span>{delayNotice}</span>
        </div>
      )}

      {/* Top AI Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#667085] flex items-center justify-between font-medium">
            <span>Downtime Reduction</span>
            <TrendingDown className="w-4 h-4 text-[#287A62]" />
          </div>
          <div className="text-[28px] font-bold text-[#287A62] mt-1 font-mono tracking-tight leading-none">
            {data?.downtime_reduction_percentage || 0}%
          </div>
          <p className="text-[10px] text-[#667085] mt-1.5 font-normal">Via Cross-Department Shadow Bundling</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#667085] flex items-center justify-between font-medium">
            <span>Track Closure Saved</span>
            <Clock className="w-4 h-4 text-[#9A111F]" />
          </div>
          <div className="text-[28px] font-bold text-[#9A111F] mt-1 font-mono tracking-tight leading-none">
            {data?.total_maintenance_hours_saved || 0} hrs
          </div>
          <p className="text-[10px] text-[#667085] mt-1.5 font-normal">Line capacity preserved</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#667085] flex items-center justify-between font-medium">
            <span>Tasks Bundled</span>
            <Layers className="w-4 h-4 text-[#21304D]" />
          </div>
          <div className="text-[28px] font-bold text-[#21304D] mt-1 font-mono tracking-tight leading-none">
            {data?.total_tasks_bundled || 0}
          </div>
          <p className="text-[10px] text-[#667085] mt-1.5 font-normal">Civil + S&T + TRD Integrated</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-4 rounded-2xl shadow-xs flex flex-col justify-between gap-2">
          <div className="text-[11px] text-[#667085] flex items-center justify-between font-medium">
            <span>Live COA Operations</span>
            <CheckCircle2 className="w-4 h-4 text-[#287A62]" />
          </div>
          <div className="flex gap-2 mt-1">
            <button 
              onClick={handleInjectLiveDelay}
              className="flex-1 bg-[#21304D]/10 hover:bg-[#21304D]/20 text-[#21304D] border border-[#21304D]/20 font-medium text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all"
            >
              <RadioTower className="w-3 h-3" />
              Simulate Delay (+35m)
            </button>
            <button 
              onClick={fetchData}
              className="bg-[#9A111F] hover:bg-[#7D0C18] text-white font-medium text-[11px] py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              Re-run
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: FULL OPERATIONS CONSOLE */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9A111F]" />
                AI Scheduled Integrated Blocks
              </h3>
              <span className="text-[11px] text-[#9A111F] bg-[#F1EDE3] px-2 py-0.5 rounded-md font-mono border border-[#D8D2C7] font-medium">
                {data?.blocks.length || 0} Corridors
              </span>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {data?.blocks.map((block) => {
                const isSelected = selectedBlock?.block_id === block.block_id;
                const isSanctioned = sanctionedIds.includes(block.block_id);

                return (
                  <div 
                    key={block.block_id}
                    onClick={() => {
                      setSelectedBlock(block);
                      handleSimulate(block, 180);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#FFFFFF] border-[#9A111F] shadow-xs ring-1 ring-[#9A111F]' 
                        : 'bg-[#FFFFFF] border-[#D8D2C7] hover:border-[#9A111F]/50 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] font-bold text-[#344054]">{block.block_id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#F1EDE3] text-[#667085] font-mono border border-[#D8D2C7]">
                          {block.section_id} ({block.track_type})
                        </span>
                      </div>
                      {isSanctioned ? (
                        <span className="text-[10px] bg-[#287A62]/10 text-[#287A62] border border-[#287A62]/30 px-2 py-0.5 rounded-full font-semibold">
                          SANCTIONED
                        </span>
                      ) : (
                        <span className="text-[10px] bg-[#9A111F]/10 text-[#9A111F] border border-[#9A111F]/30 px-2 py-0.5 rounded-full font-semibold">
                          PRIORITY {block.priority_score}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[12px] text-[#667085] mb-2">
                      <div>
                        <span className="text-[#667085]">Window: </span>
                        <span className="font-semibold text-[#344054]">{block.allocated_start_time} - {block.allocated_end_time}</span>
                        <span className="text-[#667085]"> ({block.allocated_duration_mins} mins)</span>
                      </div>
                      <div className="text-[#287A62] font-mono text-[11px] font-bold">
                        +{block.time_saved_mins}m saved
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#D8D2C7]">
                      <span className="text-[10px] text-[#667085]">Integrated:</span>
                      {block.bundled_departments.map((dept) => (
                        <span key={dept} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1EDE3] text-[#344054] flex items-center gap-1 font-mono border border-[#D8D2C7]">
                          {dept === 'CIVIL' && <ShieldAlert className="w-3 h-3 text-[#9A111F]" />}
                          {dept === 'SNT' && <Radio className="w-3 h-3 text-[#21304D]" />}
                          {dept === 'TRD' && <Zap className="w-3 h-3 text-[#287A62]" />}
                          {dept}
                        </span>
                      ))}
                      <span className="text-[10px] text-[#667085] ml-auto font-mono">
                        KM {block.start_km.toFixed(1)} - {block.end_km.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <DynamicTimeSpaceVisualizer
              trains={trains}
              selectedBlock={selectedBlock}
              delayedTrainNumber={delayedTrainNumber}
              sectionStartKm={0.0}
              sectionEndKm={63.8}
            />

            {selectedBlock && (
              <div className="bg-[#FFFFFF] border border-[#D8D2C7] rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
                      <Play className="w-4 h-4 text-[#9A111F]" />
                      "What-If" Corridor Delay Sandbox
                    </h4>
                    <p className="text-[11px] text-[#667085]">Shift maintenance window to simulate train detention impact</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDossierBlockId(selectedBlock.block_id)}
                      className="bg-[#FFFFFF] hover:bg-[#F1EDE3] text-[#344054] font-medium text-[11px] py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all border border-[#D8D2C7] shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#9A111F]" />
                      Safety Dossier (G&SR)
                    </button>

                    {!sanctionedIds.includes(selectedBlock.block_id) && (
                      <button
                        onClick={() => handleSanction(selectedBlock.block_id)}
                        className="bg-[#287A62] hover:bg-[#1E5C4A] text-white font-semibold text-[11px] py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Sanction Block
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-[#667085]">
                    <span>Simulated Start Time:</span>
                    <span className="font-mono font-bold text-[#9A111F]">
                      {Math.floor(shiftMinute / 60).toString().padStart(2, '0')}:{(shiftMinute % 60).toString().padStart(2, '0')} hrs
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1380" 
                    step="30"
                    value={shiftMinute}
                    onChange={(e) => handleSimulate(selectedBlock, parseInt(e.target.value))}
                    className="w-full accent-[#9A111F] cursor-pointer bg-[#D8D2C7] h-2 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#D8D2C7]">
                    <span className="text-[10px] text-[#667085]">Projected Passenger Delay</span>
                    <div className="text-[18px] font-bold text-[#344054] mt-0.5 font-mono">
                      {simResult?.projected_passenger_delay_mins ?? selectedBlock.estimated_passenger_delay_mins} mins
                    </div>
                  </div>

                  <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#D8D2C7]">
                    <span className="text-[10px] text-[#667085]">Projected Freight Detention</span>
                    <div className="text-[18px] font-bold text-[#344054] mt-0.5 font-mono">
                      {simResult?.projected_freight_delay_mins ?? selectedBlock.estimated_freight_delay_mins} mins
                    </div>
                  </div>
                </div>

                {simResult?.conflict_reason && (
                  <div className="bg-[#9A111F]/10 border border-[#9A111F]/30 p-2.5 rounded-xl flex items-center gap-2 text-[12px] text-[#9A111F] font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#9A111F]" />
                    <span>{simResult.conflict_reason}</span>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW 2: DEDICATED BLOCK QUEUE */}
      {activeTab === 'block_queue' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#9A111F]" />
              Full Divisional Scheduled Corridors ({data?.blocks.length || 0} Slots)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px]">
            {data?.blocks.map((blk) => (
              <div key={blk.block_id} className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] space-y-2 shadow-xs">
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-[#344054]">{blk.block_id}</span>
                  <span className="text-[#287A62] font-bold">+{blk.time_saved_mins}m saved</span>
                </div>
                <div className="text-[#667085]">{blk.section_id} ({blk.track_type})</div>
                <div className="text-[#667085] font-mono text-[11px] pt-1 border-t border-[#D8D2C7]">
                  Window: {blk.allocated_start_time} - {blk.allocated_end_time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: SANCTION GATEWAY */}
      {activeTab === 'sanctions' && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C7] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
            <h3 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#9A111F]" />
              Section Controller Block Sanction Gateway
            </h3>
          </div>
          <div className="space-y-3">
            {data?.blocks.map((blk) => (
              <div key={blk.block_id} className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] flex items-center justify-between text-[12px] shadow-xs">
                <div>
                  <span className="font-mono font-bold text-[#344054]">{blk.block_id}</span>
                  <span className="text-[#667085] ml-3">Section {blk.section_id} | {blk.allocated_start_time} - {blk.allocated_end_time}</span>
                </div>
                <button
                  onClick={() => handleSanction(blk.block_id)}
                  disabled={sanctionedIds.includes(blk.block_id)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-[11px] transition-all ${
                    sanctionedIds.includes(blk.block_id)
                      ? 'bg-[#F1EDE3] text-[#667085] border border-[#D8D2C7] cursor-not-allowed'
                      : 'bg-[#9A111F] hover:bg-[#7D0C18] text-white shadow-xs'
                  }`}
                >
                  {sanctionedIds.includes(blk.block_id) ? 'Sanctioned ✓' : 'Approve & Sanction'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeDossierBlockId && (
        <SafetyDossierModal
          blockId={activeDossierBlockId}
          onClose={() => setActiveDossierBlockId(null)}
        />
      )}

    </div>
  );
}