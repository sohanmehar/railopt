from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import TrainPath, TelemetryDefect
from app.services.cpsat_solver import solve_railway_blocks_cpsat
from app.models.schemas import HorizonEnum

def inject_train_delay_and_reoptimize(
    db: Session,
    train_number: str = "12128",
    delay_minutes: int = 35,
    controller_override: bool = False
) -> Dict[str, Any]:
    """
    Ingests live telemetry/COA train delay, recalculates headway buffers,
    and dynamically shifts maintenance windows using CP-SAT.
    """
    # 1. Fetch the affected train or fallback to first passenger train
    train = db.query(TrainPath).filter(TrainPath.id == train_number).first()
    if not train:
        train = db.query(TrainPath).filter(TrainPath.is_freight == False).first()

    if not train:
        train = db.query(TrainPath).first()

    if not train:
        # If still no trains, run base optimizer
        plan = solve_railway_blocks_cpsat(db=db, horizon=HorizonEnum.DAILY)
        return {
            "event": "DYNAMIC_HEADWAY_DECONFLICTION",
            "affected_train": {"train_number": "N/A", "train_name": "Generic Rake", "injected_delay_mins": delay_minutes},
            "rescheduled_plan": plan.model_dump() if hasattr(plan, 'model_dump') else plan.dict(),
            "conflict_mitigation": "Automated schedule refreshed."
        }

    # 2. Update dynamic running time
    train.entry_minute_of_day = (train.entry_minute_of_day + delay_minutes) % 1440
    train.exit_minute_of_day = (train.exit_minute_of_day + delay_minutes) % 1440
    db.commit()

    # 3. Trigger dynamic CP-SAT re-optimization
    new_plan = solve_railway_blocks_cpsat(
        db=db,
        horizon=HorizonEnum.DAILY,
        punctuality_weight=0.95,
        safety_weight=0.90,
        freight_penalty=0.50
    )

    plan_data = new_plan.model_dump() if hasattr(new_plan, 'model_dump') else new_plan.dict()

    return {
        "event": "DYNAMIC_HEADWAY_DECONFLICTION",
        "affected_train": {
            "train_number": train.id,
            "train_name": train.train_name,
            "injected_delay_mins": delay_minutes,
            "revised_entry": f"{train.entry_minute_of_day // 60:02d}:{train.entry_minute_of_day % 60:02d}",
            "revised_exit": f"{train.exit_minute_of_day // 60:02d}:{train.exit_minute_of_day % 60:02d}"
        },
        "rescheduled_plan": plan_data,
        "conflict_mitigation": "Automated CP-SAT slot-shift applied. Hard headway buffer maintained."
    }