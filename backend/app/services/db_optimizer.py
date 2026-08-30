from sqlalchemy.orm import Session
from typing import List, Dict
from app.models.entities import TelemetryDefect, TrainPath, SanctionedBlock
from app.models.schemas import (
    OptimizationResponse, 
    ScheduledBlock, 
    BundledTask, 
    DepartmentEnum, 
    TrackTypeEnum,
    HorizonEnum
)

def safe_track_type(val: str) -> TrackTypeEnum:
    if not val:
        return TrackTypeEnum.UP_MAIN
    try:
        return TrackTypeEnum(val)
    except ValueError:
        return TrackTypeEnum.UP_MAIN

def solve_railway_blocks_from_db(
    db: Session, 
    horizon: HorizonEnum = HorizonEnum.DAILY,
    punctuality_weight: float = 0.85,
    safety_weight: float = 0.95,
    freight_penalty: float = 0.40
) -> OptimizationResponse:
    # 1. Fetch defects and train paths directly from Neon PostgreSQL
    raw_defects = db.query(TelemetryDefect).all()
    raw_trains = db.query(TrainPath).all()

    # Spatial-Temporal Grouping by Section and Track Line
    grouped: Dict[str, List[TelemetryDefect]] = {}
    for d in raw_defects:
        key = f"{d.section_id}|{d.track_line}"
        grouped.setdefault(key, []).append(d)

    scheduled_blocks: List[ScheduledBlock] = []
    total_individual_time = 0
    total_bundled_time = 0
    block_counter = 1

    available_slot_starts = [60, 180, 360, 600, 840, 1100, 1260]

    for key, defects_in_group in grouped.items():
        section_id, track_type = key.split("|")
        
        # Spatial Clustering (KM Proximity Buffer of 2.0 KM)
        clusters: List[List[TelemetryDefect]] = []
        visited = set()

        for i, d1 in enumerate(defects_in_group):
            if i in visited:
                continue
            current_cluster = [d1]
            visited.add(i)
            
            for j, d2 in enumerate(defects_in_group):
                if j in visited:
                    continue
                if max(d1.start_km, d2.start_km) <= min(d1.end_km, d2.end_km) + 2.0:
                    current_cluster.append(d2)
                    visited.add(j)
            
            clusters.append(current_cluster)

        # Create Shadow Bundled Blocks
        for cluster in clusters:
            if not cluster:
                continue

            max_duration = max(d.required_duration_mins for d in cluster)
            sum_duration = sum(d.required_duration_mins for d in cluster)
            
            min_km = min(d.start_km for d in cluster)
            max_km = max(d.end_km for d in cluster)
            avg_priority = sum(d.priority_score for d in cluster) / len(cluster)
            depts = list(set(d.department for d in cluster))

            slot_start_min = available_slot_starts[(block_counter - 1) % len(available_slot_starts)]
            slot_end_min = slot_start_min + max_duration

            start_hh = slot_start_min // 60
            start_mm = slot_start_min % 60
            end_hh = slot_end_min // 60
            end_mm = slot_end_min % 60

            # Compute Train Detention Impact
            p_delays = 0
            f_delays = 0
            for t in raw_trains:
                if t.track_line == track_type:
                    if max(t.entry_minute_of_day, slot_start_min) < min(t.exit_minute_of_day, slot_end_min):
                        if t.is_freight:
                            f_delays += 15
                        else:
                            p_delays += 5

            time_saved = sum_duration - max_duration
            total_individual_time += sum_duration
            total_bundled_time += max_duration

            block_id = f"BLK-PUNE-2026-{block_counter:03d}"

            bundled_tasks = [
                BundledTask(
                    defect_id=d.id,
                    department=DepartmentEnum(d.department),
                    category=d.defect_type,
                    original_duration_mins=d.required_duration_mins,
                    start_km=d.start_km,
                    end_km=d.end_km,
                    equipment=d.equipment_needed or "MANUAL_TOOLS"
                ) for d in cluster
            ]

            scheduled_block = ScheduledBlock(
                block_id=block_id,
                section_id=section_id,
                track_type=safe_track_type(track_type),
                start_km=min_km,
                end_km=max_km,
                allocated_start_time=f"{start_hh:02d}:{start_mm:02d}",
                allocated_end_time=f"{end_hh:02d}:{end_mm:02d}",
                allocated_duration_mins=max_duration,
                total_individual_duration_mins=sum_duration,
                time_saved_mins=time_saved,
                bundled_departments=[DepartmentEnum(dept) for dept in depts],
                bundled_tasks=bundled_tasks,
                priority_score=round(avg_priority, 1),
                estimated_passenger_delay_mins=p_delays,
                estimated_freight_delay_mins=f_delays,
                status="PROPOSED"
            )
            scheduled_blocks.append(scheduled_block)
            block_counter += 1

    total_time_saved = total_individual_time - total_bundled_time
    pct_saved = (total_time_saved / total_individual_time * 100) if total_individual_time > 0 else 0.0

    return OptimizationResponse(
        horizon=horizon,
        total_blocks_scheduled=len(scheduled_blocks),
        total_tasks_bundled=sum(len(b.bundled_tasks) for b in scheduled_blocks),
        total_maintenance_hours_saved=round(total_time_saved / 60.0, 1),
        downtime_reduction_percentage=round(pct_saved, 1),
        blocks=scheduled_blocks
    )