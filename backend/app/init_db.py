import json
import os
from app.database import engine, Base, SessionLocal
from app.models.entities import Section, TrackAsset, TelemetryDefect, TrainPath, User
from app.services.optimizer import compute_priority_score
from app.services.auth import get_password_hash

def init_and_seed_neon_db():
    print("Connecting to Neon PostgreSQL...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed Official Railway Personnel
        if db.query(User).count() == 0:
            default_pass = get_password_hash("Railways@2026")
            users = [
                User(id="EMP-CR-PWAY-01", full_name="Rajesh Sharma", email="rajesh.civil@cr.railnet.gov.in", hashed_password=default_pass, role="CIVIL_ENG", department="CIVIL", designation="Senior Section Engineer (P-Way)"),
                User(id="EMP-CR-SNT-02", full_name="Amit Deshmukh", email="amit.snt@cr.railnet.gov.in", hashed_password=default_pass, role="SNT_ENG", department="SNT", designation="Senior Section Engineer (Signal)"),
                User(id="EMP-CR-TRD-03", full_name="Pooja Verma", email="pooja.trd@cr.railnet.gov.in", hashed_password=default_pass, role="TRD_ENG", department="TRD", designation="Senior Section Engineer (TRD / OHE)"),
                User(id="EMP-CR-COA-04", full_name="V. K. Nair", email="controller.pune@cr.railnet.gov.in", hashed_password=default_pass, role="CONTROLLER", department="OPERATIONS", designation="Chief Section Controller (COA)"),
                User(id="EMP-CR-ADMIN-05", full_name="Dr. S. K. Roy", email="srdom.pune@cr.railnet.gov.in", hashed_password=default_pass, role="SR_DOM", department="ADMIN", designation="Senior Divisional Operations Manager (Sr. DOM)")
            ]
            db.add_all(users)
            db.commit()
            print("Seeded 5 official Railway users with encrypted credentials.")

        if db.query(Section).count() == 0:
            sections_data = [
                Section(id="PUNE-SVJR", from_station="Pune Jn", to_station="Shivajinagar", start_km=0.0, end_km=2.5),
                Section(id="SVJR-KK", from_station="Shivajinagar", to_station="Khadki", start_km=2.5, end_km=6.0),
                Section(id="KK-DAPD", from_station="Khadki", to_station="Dapodi", start_km=6.0, end_km=9.5),
                Section(id="DAPD-CCH", from_station="Dapodi", to_station="Chinchwad", start_km=9.5, end_km=17.0),
                Section(id="CCH-TGN", from_station="Chinchwad", to_station="Talegaon", start_km=17.0, end_km=34.0),
                Section(id="TGN-KNHE", from_station="Talegaon", to_station="Kanhe", start_km=34.0, end_km=44.0),
                Section(id="KNHE-LNL", from_station="Kanhe", to_station="Lonavala", start_km=44.0, end_km=63.8),
            ]
            db.add_all(sections_data)
            db.commit()

        # Seed initial JSON data if empty
        if db.query(TelemetryDefect).count() == 0:
            json_path = os.path.join(os.path.dirname(__file__), "data", "railway_dataset.json")
            if os.path.exists(json_path):
                with open(json_path, "r") as f:
                    data = json.load(f)

                for d in data.get("defects", []):
                    defect_record = TelemetryDefect(
                        id=d["defect_id"],
                        source_system=d["source_system"],
                        department=d["department"],
                        section_id=d["section_id"],
                        track_line=d["track_type"],
                        start_km=d["start_km"],
                        end_km=d["end_km"],
                        defect_type=d["category"],
                        description=d.get("description", ""),
                        severity=d["severity"],
                        priority_score=compute_priority_score(d),
                        is_overdue=d.get("is_overdue", False),
                        required_duration_mins=d["required_duration_mins"],
                        equipment_needed=d.get("equipment_needed", ""),
                        post_work_tsr_kmh=d.get("post_work_tsr_kmh")
                    )
                    db.add(defect_record)

                for t in data.get("train_schedules", []):
                    train_record = TrainPath(
                        id=t["train_number"],
                        train_name=t["train_name"],
                        train_type=t["train_type"],
                        is_freight=t["is_freight"],
                        track_line=t["track_type"],
                        priority_tier=t["priority_tier"],
                        scheduled_departure=t["departure_time"],
                        scheduled_arrival=t["arrival_time"],
                        entry_minute_of_day=t["entry_minute_of_day"],
                        exit_minute_of_day=t["exit_minute_of_day"]
                    )
                    db.add(train_record)

                db.commit()
                print("Seeded baseline defects & timetable tracks into Neon DB.")
    finally:
        db.close()

if __name__ == "__main__":
    init_and_seed_neon_db()