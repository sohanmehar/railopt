'use client';

import React from 'react';
import { TrainScheduleItem, ScheduledBlock } from '@/types';
import { Train } from 'lucide-react';

interface Props {
  trains: TrainScheduleItem[];
  selectedBlock: ScheduledBlock | null;
  delayedTrainNumber?: string | null;
  sectionStartKm?: number;
  sectionEndKm?: number;
}

export default function DynamicTimeSpaceVisualizer({
  trains = [],
  selectedBlock,
  delayedTrainNumber,
  sectionStartKm = 0.0,
  sectionEndKm = 64.0
}: Props) {
  const safeTrains = Array.isArray(trains) ? trains : [];
  const width = 800;
  const height = 240;
  const paddingLeft = 45;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingRight = 15;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const timeToX = (minuteOfDay: number) => {
    return paddingLeft + (minuteOfDay / 1440) * chartW;
  };

  const kmToY = (km: number) => {
    const clampedKm = Math.max(sectionStartKm, Math.min(sectionEndKm, km));
    const ratio = (clampedKm - sectionStartKm) / (sectionEndKm - sectionStartKm);
    return paddingTop + ratio * chartH;
  };

  const parseTimeToMin = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hh, mm] = timeStr.split(':').map(Number);
    return (hh || 0) * 60 + (mm || 0);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#D8D2C7] rounded-2xl p-4 space-y-3 shadow-xs font-['Inter']">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[14px] font-semibold text-[#21304D] flex items-center gap-2">
            <Train className="w-4 h-4 text-[#9A111F]" />
            Live COA Time-Space String Chart
          </h4>
          <p className="text-[11px] text-[#667085]">
            Real-time trajectory slopes calculated from Neon DB timetable coordinates
          </p>
        </div>
        <div className="flex items-center gap-2">
          {delayedTrainNumber && (
            <span className="text-[10px] bg-[#9A111F]/10 text-[#9A111F] border border-[#9A111F]/30 font-mono px-2 py-0.5 rounded-md animate-pulse font-semibold">
              Train #{delayedTrainNumber} Delayed (+35m)
            </span>
          )}
          <span className="text-[10px] bg-[#F1EDE3] text-[#9A111F] border border-[#D8D2C7] font-mono px-2 py-0.5 rounded-md font-semibold">
            {safeTrains.length} Trains Mapped
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full bg-[#FFFFFF] rounded-xl border border-[#D8D2C7] overflow-hidden relative shadow-inner">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto select-none"
        >
          {/* Hour Grid Lines */}
          {[0, 240, 480, 720, 960, 1200, 1440].map((min) => {
            const x = timeToX(min);
            const hour = String(min / 60).padStart(2, '0');
            return (
              <g key={min}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  stroke="#E8DFD3"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={x}
                  y={height - 8}
                  fill="#667085"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {hour}:00
                </text>
              </g>
            );
          })}

          {/* KM Elevation Axis Marks */}
          {[0, 15, 30, 45, 60].map((km) => {
            const y = kmToY(km);
            return (
              <g key={km}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#E8DFD3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  fill="#667085"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  K{km}
                </text>
              </g>
            );
          })}

          {/* Train Trajectory Slopes */}
          {safeTrains.map((train) => {
            const isDelayed = String(train.train_number) === String(delayedTrainNumber);
            const x1 = timeToX(train.entry_minute_of_day);
            const y1 = kmToY(sectionStartKm);
            const x2 = timeToX(train.exit_minute_of_day);
            const y2 = kmToY(sectionEndKm);

            const isVip = train.priority_tier === 1;
            const strokeColor = isDelayed 
              ? '#9A111F' 
              : isVip 
              ? '#21304D' 
              : train.is_freight 
              ? '#667085' 
              : '#9A111F';

            return (
              <g key={train.train_number} className="group cursor-pointer">
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={isDelayed ? '3' : isVip ? '2.2' : '1.5'}
                  strokeDasharray={isDelayed ? '4,2' : undefined}
                  opacity={isDelayed ? '1' : isVip ? '0.95' : '0.75'}
                />
                {isDelayed && (
                  <text
                    x={x1 + 6}
                    y={y1 + 12}
                    fill="#9A111F"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    #{train.train_number} (+35m)
                  </text>
                )}
                <title>{`${train.train_name} (#${train.train_number}) - Entry: ${train.departure_time || train.entry_minute_of_day}`}</title>
              </g>
            );
          })}

          {/* Selected Scheduled Corridor Shadow Box */}
          {selectedBlock && (
            (() => {
              const startMin = parseTimeToMin(selectedBlock.allocated_start_time);
              const endMin = parseTimeToMin(selectedBlock.allocated_end_time);

              const boxX = timeToX(startMin);
              const boxW = Math.max(15, timeToX(endMin) - boxX);
              const boxY = kmToY(selectedBlock.start_km);
              const boxH = Math.max(20, kmToY(selectedBlock.end_km) - boxY);

              return (
                <g>
                  <rect
                    x={boxX}
                    y={boxY}
                    width={boxW}
                    height={boxH}
                    fill="#287A62"
                    fillOpacity="0.2"
                    stroke="#287A62"
                    strokeWidth="1.5"
                    rx="4"
                  />
                  <text
                    x={boxX + boxW / 2}
                    y={boxY + boxH / 2 + 3}
                    fill="#287A62"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {selectedBlock.block_id}
                  </text>
                </g>
              );
            })()
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-[#667085] pt-1 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#21304D] rounded" /> VIP / Mail Exp
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#9A111F] rounded" /> Express / Passenger
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#667085] rounded" /> Freight Rake
          </span>
          {delayedTrainNumber && (
            <span className="flex items-center gap-1 text-[#9A111F] font-semibold">
              <span className="w-2.5 h-0.5 bg-[#9A111F] rounded" /> Delayed Stream
            </span>
          )}
        </div>
        <span className="text-[#287A62] font-bold">■ Sanctioned Shadow Corridor</span>
      </div>

    </div>
  );
}