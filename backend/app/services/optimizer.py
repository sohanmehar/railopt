import json
import os
from typing import List, Dict
from app.models.schemas import (
    DefectRecord,
    TrainSchedule,
    ScheduledBlock,
    BundledTask,
    OptimizationResponse,
    HorizonEnum,
    DepartmentEnum,
    TrackTypeEnum
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "railway_dataset.json")

def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Mock data not found at {DATA_PATH}. Run generate_mock_data.py first.")
    with open(DATA_PATH, "r") as f:
        return json.load(f)

# 1. Criticality Scoring Function (Pi)
def compute_priority_score(defect: dict) -> float:
    score = 0.0
    
    # Severity weight
    if defect["severity"] == "CRITICAL":
        score += 45.0
    elif defect["severity"] == "URGENT":
        score += 25.0
    else: # ROUTINE
        score += 10.0
        
    # Overdue weight
    if defect.get("is_overdue", False):
        score += 25.0
        
    # Speed Restriction (TSR) Penalty
    if defect.get("post_work_tsr_kmh"):
        score += 15.0
        
    # Heavy machinery requirement weight
    if defect.get("equipment_needed") in ["CSM_TAMPING_MACHINE", "BCM_SCREENER", "TOWER_WAGON_8W"]:
        score += 15.0
        
    return min(100.0, score)

# 2. Heuristic Shadow Bundler & Corridor Slotting
def safe_track_type(val: str) -> TrackTypeEnum:
    if not val:
        return TrackTypeEnum.UP_MAIN
    try:
        return TrackTypeEnum(val)
    except ValueError:
        return TrackTypeEnum.UP_MAIN

def run_optimization_engine(horizon: HorizonEnum = HorizonEnum.DAILY) -> OptimizationResponse:
    data = load_data()
    raw_defects = data["defects"]
    raw_trains = data["train_schedules"]

    # Calculate Priority Scores for all defects
    for d in raw_defects:
        d["priority_score"] = compute_priority_score(d)

    # Sort defects by priority score descending
    raw_defects.sort(key=lambda x: x["priority_score"], reverse=True)

    # Spatial-Temporal Grouping (By Section & Track Type)
    grouped: Dict[str, List[dict]] = {}
    for d in raw_defects:
        key = f"{d['section_id']}|{d['track_type']}"
        grouped.setdefault(key, []).append(d)

    scheduled_blocks: List[ScheduledBlock] = []
    total_individual_time = 0
    total_bundled_time = 0
    block_counter = 1

    # Base start times across the 24-hr day for slots
    available_slot_starts = [60, 180, 360, 600, 840, 1100, 1260] # in minutes

    for key, defects_in_group in grouped.items():
        section_id, track_type = key.split("|")
        
        # We process defects in clusters of overlapping or adjacent KM spans
        clusters: List[List[dict]] = []
        visited = set()

        for i, d1 in enumerate(defects_in_group):
            if i in visited:
                continue
            current_cluster = [d1]
            visited.add(i)
            
            for j, d2 in enumerate(defects_in_group):
                if j in visited:
                    continue
                # Overlap check: start_km_1 <= end_km_2 and start_km_2 <= end_km_1 (+ buffer of 2.0 km)
                if max(d1["start_km"], d2["start_km"]) <= min(d1["end_km"], d2["end_km"]) + 2.0:
                    current_cluster.append(d2)
                    visited.add(j)
            
            clusters.append(current_cluster)

        # Convert each cluster into an Integrated Shadow Block
        for cluster in clusters:
            if not cluster:
                continue

            # Core shadow block logic:
            # Bundled duration = MAX duration among all requests in this cluster
            max_duration = max(d["required_duration_mins"] for d in cluster)
            sum_duration = sum(d["required_duration_mins"] for d in cluster)
            
            min_km = min(d["start_km"] for d in cluster)
            max_km = max(d["end_km"] for d in cluster)
            avg_priority = sum(d["priority_score"] for d in cluster) / len(cluster)
            depts = list(set(d["department"] for d in cluster))

            slot_start_min = available_slot_starts[(block_counter - 1) % len(available_slot_starts)]
            slot_end_min = slot_start_min + max_duration

            start_hh = slot_start_min // 60
            start_mm = slot_start_min % 60
            end_hh = slot_end_min // 60
            end_mm = slot_end_min % 60

            # Calculate train impact (passenger vs freight)
            passenger_delays = 0
            freight_delays = 0
            for t in raw_trains:
                if t["track_type"] == track_type:
                    # Check overlap with block window
                    if max(t["entry_minute_of_day"], slot_start_min) < min(t["exit_minute_of_day"], slot_end_min):
                        if t["is_freight"]:
                            freight_delays += 15
                        else:
                            passenger_delays += 5

            bundled_tasks = [
                BundledTask(
                    defect_id=d["defect_id"],
                    department=DepartmentEnum(d["department"]),
                    category=d["category"],
                    original_duration_mins=d["required_duration_mins"],
                    start_km=d["start_km"],
                    end_km=d["end_km"],
                    equipment=d["equipment_needed"]
                ) for d in cluster
            ]

            time_saved = sum_duration - max_duration
            total_individual_time += sum_duration
            total_bundled_time += max_duration

            scheduled_blocks.append(
                ScheduledBlock(
                    block_id=f"BLK-PUNE-2026-{block_counter:03d}",
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
                    estimated_passenger_delay_mins=passenger_delays,
                    estimated_freight_delay_mins=freight_delays,
                    status="PROPOSED"
                )
            )
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

# 3. What-If Simulation Sandbox Engine
def simulate_schedule_delay(block_id: str, new_start_minute: int, duration_mins: int, track_type: str) -> dict:
    data = load_data()
    raw_trains = data["train_schedules"]
    
    new_end_minute = new_start_minute + duration_mins
    impacted_trains = []
    p_delay = 0
    f_delay = 0
    
    for t in raw_trains:
        if t["track_type"] == track_type:
            # Overlap check
            if max(t["entry_minute_of_day"], new_start_minute) < min(t["exit_minute_of_day"], new_end_minute):
                impacted_trains.append(f"{t['train_name']} ({t['train_number']})")
                if t["is_freight"]:
                    f_delay += 20
                else:
                    p_delay += 10

    # If Vande Bharat or High Priority express is blocked, flag constraint warning
    conflict_reason = None
    if any("VANDE BHARAT" in name.upper() for name in impacted_trains):
        conflict_reason = "CRITICAL WARNING: Direct conflict with Vande Bharat Priority Corridor."

    return {
        "block_id": block_id,
        "projected_passenger_delay_mins": p_delay,
        "projected_freight_delay_mins": f_delay,
        "impacted_trains": impacted_trains,
        "is_feasible": p_delay <= 15,
        "conflict_reason": conflict_reason
    }