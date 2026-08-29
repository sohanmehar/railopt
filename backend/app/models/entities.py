import uuid
from datetime import datetime
from sqlalchemy import (
    Column, 
    String, 
    Float, 
    Integer, 
    Boolean, 
    DateTime, 
    ForeignKey, 
    Enum, 
    Text, 
    JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class TrackLineEnum(str, Enum):
    UP_MAIN = "UP_MAIN"
    DOWN_MAIN = "DOWN_MAIN"
    SINGLE_LINE = "SINGLE_LINE"
    LOOP_LINE = "LOOP_LINE"

class DepartmentEnum(str, Enum):
    CIVIL = "CIVIL"
    SNT = "SNT"
    TRD = "TRD"
    OPERATIONS = "OPERATIONS"
    ADMIN = "ADMIN"

class SeverityEnum(str, Enum):
    CRITICAL = "CRITICAL"
    URGENT = "URGENT"
    ROUTINE = "ROUTINE"

class BlockStatusEnum(str, Enum):
    PROPOSED = "PROPOSED"
    OPTIMIZED = "OPTIMIZED"
    SANCTIONED = "SANCTIONED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

# 1. Spatial Corridor Section
class Section(Base):
    __tablename__ = "sections"

    id = Column(String(50), primary_key=True) # e.g. "PUNE-LNL"
    division = Column(String(50), nullable=False, default="PUNE")
    from_station = Column(String(100), nullable=False)
    to_station = Column(String(100), nullable=False)
    start_km = Column(Float, nullable=False)
    end_km = Column(Float, nullable=False)
    total_tracks = Column(Integer, default=2)
    max_sectional_speed = Column(Integer, default=110)

    assets = relationship("TrackAsset", back_populates="section")
    defects = relationship("TelemetryDefect", back_populates="section")

# 2. Track & Fixed Assets Ledger
class TrackAsset(Base):
    __tablename__ = "track_assets"

    id = Column(String(50), primary_key=True) # e.g. "PT-104A", "OHE-MAST-142/10"
    section_id = Column(String(50), ForeignKey("sections.id"), nullable=False)
    department = Column(String(20), nullable=False) # CIVIL, SNT, TRD
    asset_type = Column(String(50), nullable=False) # SWITCH, TRACK_CIRCUIT, OHE_INSULATOR
    track_line = Column(String(20), nullable=False)
    location_km = Column(Float, nullable=False)
    health_index = Column(Float, default=100.0) # 0 to 100
    last_inspected_at = Column(DateTime, default=datetime.utcnow)

    section = relationship("Section", back_populates="assets")

# 3. Telemetry Defects (TMS / SMMS / TDMS Feed)
class TelemetryDefect(Base):
    __tablename__ = "telemetry_defects"

    id = Column(String(50), primary_key=True) # e.g. "TMS-0001"
    source_system = Column(String(20), nullable=False) # TMS, SMMS, TDMS
    department = Column(String(20), nullable=False)
    section_id = Column(String(50), ForeignKey("sections.id"), nullable=False)
    track_line = Column(String(20), nullable=False)
    start_km = Column(Float, nullable=False)
    end_km = Column(Float, nullable=False)
    defect_type = Column(String(100), nullable=False) # USFD_CRACK, POINT_FAIL, OHE_WEAR
    description = Column(Text, nullable=True)
    severity = Column(String(20), default="ROUTINE")
    priority_score = Column(Float, default=0.0)
    is_overdue = Column(Boolean, default=False)
    required_duration_mins = Column(Integer, nullable=False)
    equipment_needed = Column(String(100), nullable=True)
    post_work_tsr_kmh = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    section = relationship("Section", back_populates="defects")

# 4. COA Timetable & Live Paths
class TrainPath(Base):
    __tablename__ = "train_paths"

    id = Column(String(50), primary_key=True) # e.g. "12128", "90102"
    train_name = Column(String(100), nullable=False)
    train_type = Column(String(50), nullable=False) # VANDE_BHARAT, EXPRESS, GOODS
    is_freight = Column(Boolean, default=False)
    track_line = Column(String(20), nullable=False)
    priority_tier = Column(Integer, nullable=False) # 1 (VIP) to 4 (Freight)
    scheduled_departure = Column(String(10), nullable=False) # "01:30"
    scheduled_arrival = Column(String(10), nullable=False)
    entry_minute_of_day = Column(Integer, nullable=False)
    exit_minute_of_day = Column(Integer, nullable=False)

# 5. Sanctioned Shadow Blocks Ledger
class SanctionedBlock(Base):
    __tablename__ = "sanctioned_blocks"

    id = Column(String(50), primary_key=True) # e.g. "BLK-PUNE-2026-001"
    section_id = Column(String(50), ForeignKey("sections.id"), nullable=False)
    track_line = Column(String(20), nullable=False)
    start_km = Column(Float, nullable=False)
    end_km = Column(Float, nullable=False)
    allocated_start_time = Column(String(10), nullable=False)
    allocated_end_time = Column(String(10), nullable=False)
    allocated_duration_mins = Column(Integer, nullable=False)
    total_individual_duration_mins = Column(Integer, nullable=False)
    time_saved_mins = Column(Integer, default=0)
    bundled_departments = Column(JSON, nullable=False) # ["CIVIL", "SNT", "TRD"]
    bundled_task_details = Column(JSON, nullable=False) # Full task breakdown
    priority_score = Column(Float, nullable=False)
    status = Column(String(20), default="PROPOSED")
    sanctioned_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    permits = relationship("StatutoryPermit", back_populates="block")

# 6. Statutory Railway Safety Permits (T/351, PTW, T/409)
class StatutoryPermit(Base):
    __tablename__ = "statutory_permits"

    id = Column(String(50), primary_key=True) # e.g. "T351-2026-001"
    block_id = Column(String(50), ForeignKey("sanctioned_blocks.id"), nullable=False)
    permit_type = Column(String(50), nullable=False) # FORM_T351, TRD_POWER_PTW, CAUTION_T409
    department = Column(String(20), nullable=False)
    issued_by = Column(String(100), nullable=False)
    status = Column(String(20), default="ISSUED") # ISSUED, ACTIVE_WORK, CANCELLED_RESTORED
    details = Column(JSON, nullable=True) # Gear IDs, Disconnection tokens, Speed restrictions
    issued_at = Column(DateTime, default=datetime.utcnow)
    cleared_at = Column(DateTime, nullable=True)

    block = relationship("SanctionedBlock", back_populates="permits")

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True) # e.g. "EMP-CR-1048"
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # CIVIL_ENG, SNT_ENG, TRD_ENG, CONTROLLER, SR_DOM
    department = Column(String(20), nullable=False) # CIVIL, SNT, TRD, OPERATIONS, ADMIN
    division = Column(String(50), default="PUNE")
    designation = Column(String(100), nullable=False)