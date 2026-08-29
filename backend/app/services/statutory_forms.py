from datetime import datetime
from typing import Dict, Any, List
from app.models.entities import SanctionedBlock, StatutoryPermit, TelemetryDefect

def generate_form_t351_disconnection(
    block_id: str,
    section_id: str,
    track_line: str,
    start_km: float,
    end_km: float,
    gears_affected: List[str],
    issued_by_sse: str = "Amit Deshmukh (SSE/Signal)",
    sanctioned_by_ctrl: str = "V. K. Nair (Chief Controller)"
) -> Dict[str, Any]:
    """
    Indian Railways Form S&T (T/351) - Disconnection Notice
    Authorizes bypassing and disconnection of interlocking gear.
    """
    return {
        "form_type": "FORM_SNT_T351",
        "title": "DISCONNECTION & RECONNECTION NOTICE (RULE G&SR 3.51)",
        "reference_block_id": block_id,
        "section_id": section_id,
        "track_line": track_line,
        "km_span": f"{start_km:.2f} - {end_km:.2f}",
        "gears_isolated": gears_affected or ["PT-104A", "AXLE_COUNTER_LNL_UP"],
        "disconnection_timestamp": datetime.utcnow().isoformat(),
        "sse_signoff": issued_by_sse,
        "controller_acknowledgement": sanctioned_by_ctrl,
        "status": "DISCONNECTED_SAFE_FOR_WORK",
        "legal_notice": "Under no circumstances shall affected points be operated from panel during active disconnection."
    }

def generate_trd_power_ptw(
    block_id: str,
    section_id: str,
    elementary_section: str,
    feed_post: str = "FP-PUNE-01",
    issued_by_sse: str = "Pooja Verma (SSE/TRD)",
    controller_name: str = "Chief Controller (COA)"
) -> Dict[str, Any]:
    """
    TRD Permit to Work (PTW) for 25 kV AC Traction Overhead Equipment
    """
    return {
        "form_type": "TRD_POWER_BLOCK_PTW",
        "title": "PERMIT TO WORK (25 kV AC TRACTION OVERHEAD EQUIPMENT)",
        "reference_block_id": block_id,
        "section_id": section_id,
        "elementary_section_id": elementary_section or "ES-LNL-UP-04",
        "feeding_post": feed_post,
        "voltage_isolated_kv": 25.0,
        "earth_discharge_rods_planted": [
            f"EARTH-ROD-KM-{section_id}-A",
            f"EARTH-ROD-KM-{section_id}-B"
        ],
        "isolation_verified_by_tpd": True,
        "ptw_issued_timestamp": datetime.utcnow().isoformat(),
        "sse_trd_signature": issued_by_sse,
        "tso_controller_token": f"TOKEN-PWR-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "status": "DE_ENERGIZED_AND_GROUNDED"
    }

def generate_caution_order_t409(
    block_id: str,
    section_id: str,
    track_line: str,
    start_km: float,
    end_km: float,
    restricted_speed_kmh: int = 30,
    normal_speed_kmh: int = 110,
    cause: str = "POST_TAMPING_TRACK_STABILIZATION",
    issued_by_aen: str = "Rajesh Sharma (SSE/P-Way)"
) -> Dict[str, Any]:
    """
    Engineering Caution Order (Form T/409) for Loco Pilots & Guards
    """
    return {
        "form_type": "CAUTION_ORDER_T409",
        "title": "ENGINEERING CAUTION ORDER (FORM T/409)",
        "reference_block_id": block_id,
        "section_id": section_id,
        "track_line": track_line,
        "speed_restriction_zone": f"KM {start_km:.2f} TO KM {end_km:.2f}",
        "max_allowable_speed_kmh": restricted_speed_kmh,
        "normal_sectional_speed_kmh": normal_speed_kmh,
        "reason_for_restriction": cause,
        "whistle_board_distance_meters": 600,
        "speed_indicator_board_distance_meters": 30,
        "effective_from": datetime.utcnow().isoformat(),
        "issued_by": issued_by_aen,
        "status": "DISPATCHED_TO_FOIS_AND_CREW_LOBBY"
    }