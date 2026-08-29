from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class DepartmentEnum(str, Enum):
    CIVIL = "CIVIL"
    SNT = "SNT"
    TRD = "TRD"

class TrackTypeEnum(str, Enum):
    UP_MAIN = "UP_MAIN"
    DOWN_MAIN = "DOWN_MAIN"
    SINGLE_LINE = "SINGLE_LINE"

class SeverityEnum(str, Enum):
    CRITICAL = "CRITICAL"
    URGENT = "URGENT"
    ROUTINE = "ROUTINE"

class HorizonEnum(str, Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"

# --- Ingestion Schemas ---

class DefectRecord(BaseModel):
    defect_id: str
    department: DepartmentEnum
    source_system: str
    section_id: str
    track_type: TrackTypeEnum
    start_km: float
    end_km: float
    category: str
    description: str
    severity: SeverityEnum
    is_overdue: bool
    required_duration_mins: int
    equipment_needed: str
    post_work_tsr_kmh: Optional[int] = None
    priority_score: Optional[float] = 0.0

class TrainSchedule(BaseModel):
    train_number: str
    train_name: str
    train_type: str
    is_freight: bool
    track_type: TrackTypeEnum
    priority_tier: int
    departure_time: str
    arrival_time: str
    entry_minute_of_day: int
    exit_minute_of_day: int

# --- Optimization Output Schemas ---

class BundledTask(BaseModel):
    defect_id: str
    department: DepartmentEnum
    category: str
    original_duration_mins: int
    start_km: float
    end_km: float
    equipment: str

class ScheduledBlock(BaseModel):
    block_id: str
    section_id: str
    track_type: TrackTypeEnum
    start_km: float
    end_km: float
    allocated_start_time: str
    allocated_end_time: str
    allocated_duration_mins: int
    total_individual_duration_mins: int
    time_saved_mins: int
    bundled_departments: List[DepartmentEnum]
    bundled_tasks: List[BundledTask]
    priority_score: float
    estimated_passenger_delay_mins: int
    estimated_freight_delay_mins: int
    status: str = "PROPOSED"

class OptimizationResponse(BaseModel):
    horizon: HorizonEnum
    total_blocks_scheduled: int
    total_tasks_bundled: int
    total_maintenance_hours_saved: float
    downtime_reduction_percentage: float
    blocks: List[ScheduledBlock]

class DelaySimulationRequest(BaseModel):
    block_id: str
    shifted_start_minute: int
    duration_mins: int
    track_type: TrackTypeEnum

class DelaySimulationResponse(BaseModel):
    block_id: str
    projected_passenger_delay_mins: int
    projected_freight_delay_mins: int
    impacted_trains: List[str]
    is_feasible: bool
    conflict_reason: Optional[str] = None