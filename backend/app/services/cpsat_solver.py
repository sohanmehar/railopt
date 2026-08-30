from ortools.sat.python import cp_model
from sqlalchemy.orm import Session
from typing import List, Dict
import math

from app.models.entities import TelemetryDefect, TrainPath
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

def solve_railway_blocks_cpsat(
    db: Session, 
    horizon: HorizonEnum = HorizonEnum.DAILY,
    punctuality_weight: float = 0.85,
    safety_weight: float = 0.95,
    freight_penalty: float = 0.40
) -> OptimizationResponse:
    
    # 1. Fetch live telemetry defects & train schedules from Neon DB
    defects = db.query(TelemetryDefect).all()
    trains = db.query(TrainPath).all()

    if not defects:
        try:
            from app.init_db import init_and_seed_neon_db
            init_and_seed_neon_db()
            defects = db.query(TelemetryDefect).all()
            trains = db.query(TrainPath).all()
        except Exception as e:
            print("Auto-seed error on empty defects:", e)

    if not defects:
        return OptimizationResponse(
            horizon=horizon,
            total_blocks_scheduled=0,
            total_tasks_bundled=0,
            total_maintenance_hours_saved=0.0,
            downtime_reduction_percentage=0.0,
            blocks=[]
        )

    # Group defects spatially by Section & Track Line
    spatial_groups: Dict[str, List[TelemetryDefect]] = {}
    for d in defects:
        key = f"{d.section_id}|{d.track_line}"
        spatial_groups.setdefault(key, []).append(d)

    scheduled_blocks: List[ScheduledBlock] = []
    total_individual_duration = 0
    total_bundled_duration = 0
    block_counter = 1

    # Available time slots (Day divided into candidate block intervals in minutes)
    candidate_windows = [
        (60, 240),    # 01:00 - 04:00 (Night Slot)
        (180, 360),   # 03:00 - 06:00 (Early Morning Slot)
        (360, 540),   # 06:00 - 09:00 (Morning Slot)
        (600, 780),   # 10:00 - 13:00 (Mid-Day Slot)
        (840, 1020),  # 14:00 - 17:00 (Afternoon Slot)
        (1140, 1320)  # 19:00 - 22:00 (Evening Slot)
    ]

    for key, task_group in spatial_groups.items():
        section_id, track_line = key.split("|")
        
        # Spatial Sub-Clustering by KM buffer (2.0 km)
        sub_clusters: List[List[TelemetryDefect]] = []
        visited = set()

        for i, t1 in enumerate(task_group):
            if i in visited:
                continue
            cluster = [t1]
            visited.add(i)
            for j, t2 in enumerate(task_group):
                if j in visited:
                    continue
                if max(t1.start_km, t2.start_km) <= min(t1.end_km, t2.end_km) + 2.0:
                    cluster.append(t2)
                    visited.add(j)
            sub_clusters.append(cluster)

        for cluster in sub_clusters:
            if not cluster:
                continue

            # Initialize CP-SAT Model for this corridor bundle
            model = cp_model.CpModel()

            # Decision Variables
            # Required window duration is bounded by max duration among bundled tasks
            min_required_duration = max(t.required_duration_mins for t in cluster)
            cluster_sum_duration = sum(t.required_duration_mins for t in cluster)

            # Slot selection binary variables
            slot_vars = [model.NewBoolVar(f"slot_{idx}") for idx in range(len(candidate_windows))]
            
            # Constraint: Exactly one time-window must be chosen
            model.Add(sum(slot_vars) == 1)

            # Constraint: Heavy Track Machine headway & buffer
            # If both Heavy Machine (CSM/BCM) and Tower Wagon exist, maintain buffer
            has_heavy_machine = any(t.equipment_needed in ["CSM_TAMPING_MACHINE", "BCM_SCREENER"] for t in cluster)
            has_tower_wagon = any(t.equipment_needed == "TOWER_WAGON_8W" for t in cluster)
            
            extra_buffer = 30 if (has_heavy_machine and has_tower_wagon) else 0
            allocated_duration = min_required_duration + extra_buffer

            # Objective Cost calculation across candidate windows
            objective_terms = []
            slot_costs = []

            for idx, (win_start, win_end) in enumerate(candidate_windows):
                win_available_mins = win_end - win_start
                if win_available_mins < allocated_duration:
                    # Infeasible window
                    model.Add(slot_vars[idx] == 0)
                    slot_costs.append(999999)
                    continue

                actual_end = win_start + allocated_duration

                # Calculate train detention costs
                passenger_penalty = 0
                freight_penalty_mins = 0

                for train in trains:
                    if train.track_line == track_line:
                        # Overlap condition
                        if max(train.entry_minute_of_day, win_start) < min(train.exit_minute_of_day, actual_end):
                            if train.priority_tier == 1: # High Priority VIP / Vande Bharat
                                passenger_penalty += 5000 # Hard avoid penalty
                            elif train.is_freight:
                                freight_penalty_mins += 15
                            else:
                                passenger_penalty += 50

                # Weighted objective calculation
                total_cost = int(
                    (passenger_penalty * punctuality_weight) + 
                    (freight_penalty_mins * freight_penalty * 10) - 
                    (cluster_sum_duration * safety_weight)
                )
                slot_costs.append(total_cost)
                objective_terms.append(slot_vars[idx] * total_cost)

            model.Minimize(sum(objective_terms))

            # Solve CP-SAT
            solver = cp_model.CpSolver()
            solver.parameters.max_time_in_seconds = 2.0
            status = solver.Solve(model)

            selected_slot_idx = 0
            if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
                for idx in range(len(candidate_windows)):
                    if solver.Value(slot_vars[idx]) == 1:
                        selected_slot_idx = idx
                        break
            else:
                # Fallback to night slot if heavily constrained
                selected_slot_idx = (block_counter - 1) % len(candidate_windows)

            chosen_start, _ = candidate_windows[selected_slot_idx]
            chosen_end = chosen_start + allocated_duration

            start_hh = chosen_start // 60
            start_mm = chosen_start % 60
            end_hh = chosen_end // 60
            end_mm = chosen_end % 60

            # Calculate metrics
            min_km = min(t.start_km for t in cluster)
            max_km = max(t.end_km for t in cluster)
            avg_priority = sum(t.priority_score for t in cluster) / len(cluster)
            depts = list(set(t.department for t in cluster))
            time_saved = cluster_sum_duration - allocated_duration

            total_individual_duration += cluster_sum_duration
            total_bundled_duration += allocated_duration

            # Recalculate exact final delays
            p_delay_final = 0
            f_delay_final = 0
            for train in trains:
                if train.track_line == track_line:
                    if max(train.entry_minute_of_day, chosen_start) < min(train.exit_minute_of_day, chosen_end):
                        if train.is_freight:
                            f_delay_final += 15
                        else:
                            p_delay_final += 5

            bundled_tasks = [
                BundledTask(
                    defect_id=t.id,
                    department=DepartmentEnum(t.department),
                    category=t.defect_type,
                    original_duration_mins=t.required_duration_mins,
                    start_km=t.start_km,
                    end_km=t.end_km,
                    equipment=t.equipment_needed or "MANUAL_GANG"
                ) for t in cluster
            ]

            scheduled_blocks.append(
                ScheduledBlock(
                    block_id=f"BLK-PUNE-2026-{block_counter:03d}",
                    section_id=section_id,
                    track_type=safe_track_type(track_line),
                    start_km=min_km,
                    end_km=max_km,
                    allocated_start_time=f"{start_hh:02d}:{start_mm:02d}",
                    allocated_end_time=f"{end_hh:02d}:{end_mm:02d}",
                    allocated_duration_mins=allocated_duration,
                    total_individual_duration_mins=cluster_sum_duration,
                    time_saved_mins=max(0, time_saved),
                    bundled_departments=[DepartmentEnum(d) for d in depts],
                    bundled_tasks=bundled_tasks,
                    priority_score=round(avg_priority, 1),
                    estimated_passenger_delay_mins=p_delay_final,
                    estimated_freight_delay_mins=f_delay_final,
                    status="PROPOSED"
                )
            )
            block_counter += 1

    total_saved = max(0, total_individual_duration - total_bundled_duration)
    pct_saved = (total_saved / total_individual_duration * 100) if total_individual_duration > 0 else 0.0

    return OptimizationResponse(
        horizon=horizon,
        total_blocks_scheduled=len(scheduled_blocks),
        total_tasks_bundled=sum(len(b.bundled_tasks) for b in scheduled_blocks),
        total_maintenance_hours_saved=round(total_saved / 60.0, 1),
        downtime_reduction_percentage=round(pct_saved, 1),
        blocks=scheduled_blocks
    )