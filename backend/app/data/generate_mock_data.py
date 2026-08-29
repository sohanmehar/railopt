import json
import random
from datetime import datetime, timedelta

# Realistic Pune - Lonavala Sub-division Corridor Topology
SECTIONS = [
    {"section_id": "PUNE-SVJR", "from_stn": "Pune Jn", "to_stn": "Shivajinagar", "start_km": 0.0, "end_km": 2.5},
    {"section_id": "SVJR-KK", "from_stn": "Shivajinagar", "to_stn": "Khadki", "start_km": 2.5, "end_km": 6.0},
    {"section_id": "KK-DAPD", "from_stn": "Khadki", "to_stn": "Dapodi", "start_km": 6.0, "end_km": 9.5},
    {"section_id": "DAPD-CCH", "from_stn": "Dapodi", "to_stn": "Chinchwad", "start_km": 9.5, "end_km": 17.0},
    {"section_id": "CCH-TGN", "from_stn": "Chinchwad", "to_stn": "Talegaon", "start_km": 17.0, "end_km": 34.0},
    {"section_id": "TGN-KNHE", "from_stn": "Talegaon", "to_stn": "Kanhe", "start_km": 34.0, "end_km": 44.0},
    {"section_id": "KNHE-LNL", "from_stn": "Kanhe", "to_stn": "Lonavala", "start_km": 44.0, "end_km": 63.8},
]

TRACK_TYPES = ["UP_MAIN", "DOWN_MAIN"]

def build_dataset():
    data = {
        "metadata": {
            "division": "PUNE",
            "line": "Pune - Lonavala Quad/Double Track Section",
            "generated_at": datetime.now().isoformat()
        },
        "defects": [],
        "train_schedules": []
    }

    # 1. Inject Deterministic Overlapping Scenario for Demo (Lonavala - Kanhe)
    # Ye teeno demo me 100% Shadow Bundle hokar dikhenge!
    demo_sec = SECTIONS[6] # KNHE-LNL
    data["defects"].extend([
        {
            "defect_id": "TMS-DEMO-001",
            "department": "CIVIL",
            "source_system": "TMS",
            "section_id": demo_sec["section_id"],
            "track_type": "UP_MAIN",
            "start_km": 52.10,
            "end_km": 54.50,
            "category": "USFD_RAIL_CRACK",
            "description": "Critical ultrasonic flaw on outer rail curve.",
            "severity": "CRITICAL",
            "is_overdue": True,
            "required_duration_mins": 180,
            "equipment_needed": "CSM_TAMPING_MACHINE",
            "post_work_tsr_kmh": 30
        },
        {
            "defect_id": "SMMS-DEMO-002",
            "department": "SNT",
            "source_system": "SMMS",
            "section_id": demo_sec["section_id"],
            "track_type": "UP_MAIN",
            "start_km": 52.80,
            "end_km": 53.20,
            "category": "POINT_MACHINE_FAILURE",
            "description": "High friction and gear calibration overdue on Point #104A.",
            "severity": "CRITICAL",
            "is_overdue": True,
            "required_duration_mins": 90,
            "equipment_needed": "CALIBRATION_TOOLKIT",
            "post_work_tsr_kmh": None
        },
        {
            "defect_id": "TDMS-DEMO-003",
            "department": "TRD",
            "source_system": "TDMS",
            "section_id": demo_sec["section_id"],
            "track_type": "UP_MAIN",
            "start_km": 51.50,
            "end_km": 55.00,
            "category": "OHE_CONTACT_WIRE_INSPECTION",
            "description": "Overdue periodic catenary insulator replacement & height adjustment.",
            "severity": "ROUTINE",
            "is_overdue": True,
            "required_duration_mins": 150,
            "equipment_needed": "TOWER_WAGON_8W",
            "post_work_tsr_kmh": None
        }
    ])

    # 2. Generate Random Realistic Defects (TMS, SMMS, TDMS)
    for i in range(4, 35):
        sec = random.choice(SECTIONS)
        track = random.choice(TRACK_TYPES)
        dept = random.choice(["CIVIL", "SNT", "TRD"])
        
        start_k = round(random.uniform(sec["start_km"], sec["end_km"] - 1.0), 2)
        end_k = round(start_k + random.uniform(0.2, 2.0), 2)
        severity = random.choices(["CRITICAL", "URGENT", "ROUTINE"], weights=[25, 35, 40])[0]
        duration = random.choice([60, 90, 120, 180, 240])

        if dept == "CIVIL":
            src = "TMS"
            cat = random.choice(["USFD_RAIL_CRACK", "TRACK_TAMPING", "DEEP_SCREENING", "WELD_REPAIR"])
            eq = random.choice(["CSM_TAMPING_MACHINE", "BCM_SCREENER", "MANUAL_GANG"])
            tsr = random.choice([30, 45, None])
        elif dept == "SNT":
            src = "SMMS"
            cat = random.choice(["POINT_MACHINE_FAILURE", "AXLE_COUNTER_MISMATCH", "TRACK_CIRCUIT_DROP"])
            eq = "CALIBRATION_TOOLKIT"
            tsr = None
        else:
            src = "TDMS"
            cat = random.choice(["OHE_CONTACT_WIRE_INSPECTION", "INSULATOR_HOTSPOT", "CANTILEVER_ADJUSTMENT"])
            eq = "TOWER_WAGON_8W"
            tsr = None

        data["defects"].append({
            "defect_id": f"{src}-{i:04d}",
            "department": dept,
            "source_system": src,
            "section_id": sec["section_id"],
            "track_type": track,
            "start_km": start_k,
            "end_km": end_k,
            "category": cat,
            "description": f"Automated maintenance trigger for {cat.replace('_', ' ').title()}.",
            "severity": severity,
            "is_overdue": random.choice([True, False]),
            "required_duration_mins": duration,
            "equipment_needed": eq,
            "post_work_tsr_kmh": tsr
        })

    # 3. Generate Timetable (COA) Trains
    train_types = [
        {"name": "VANDE_BHARAT", "priority": 1, "is_freight": False, "speed": 110},
        {"name": "EXPRESS", "priority": 2, "is_freight": False, "speed": 90},
        {"name": "LOCAL_EMU", "priority": 3, "is_freight": False, "speed": 70},
        {"name": "GOODS_CONTAINER", "priority": 4, "is_freight": True, "speed": 50},
    ]

    base_dt = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    for t_idx in range(1, 30):
        t_meta = random.choice(train_types)
        track = random.choice(TRACK_TYPES)
        start_min = random.randint(30, 1380) # 24 hrs
        entry_time = base_dt + timedelta(minutes=start_min)
        transit_duration = int((64.0 / t_meta["speed"]) * 60) # duration to cross 64 km
        exit_time = entry_time + timedelta(minutes=transit_duration)

        data["train_schedules"].append({
            "train_number": f"{90000 + t_idx if t_meta['is_freight'] else 12000 + t_idx}",
            "train_name": f"{t_meta['name'].replace('_', ' ')} #{t_idx}",
            "train_type": t_meta["name"],
            "is_freight": t_meta["is_freight"],
            "track_type": track,
            "priority_tier": t_meta["priority"],
            "departure_time": entry_time.strftime("%H:%M"),
            "arrival_time": exit_time.strftime("%H:%M"),
            "entry_minute_of_day": start_min,
            "exit_minute_of_day": start_min + transit_duration
        })

    return data

if __name__ == "__main__":
    dataset = build_dataset()
    with open("app/data/railway_dataset.json", "w") as f:
        json.dump(dataset, f, indent=2)
    print(f"Generated {len(dataset['defects'])} defects and {len(dataset['train_schedules'])} train timetable paths in app/data/railway_dataset.json")