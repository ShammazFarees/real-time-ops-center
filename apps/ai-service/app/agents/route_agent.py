import math
from datetime import datetime
from typing import List
from app.schemas import IncidentInput, SuggestedUnit, IncidentCategory, ReasoningStep

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def run_route_agent(input_data: IncidentInput, category: IncidentCategory) -> dict:
    inc_lng, inc_lat = input_data.coordinates[0], input_data.coordinates[1]

    # Pre-defined Pakistani emergency response units pool near metropolitan grid
    units_pool = [
        {"id": "UNIT-R1122-FIRE", "name": "Rescue 1122 Fire Tender 101", "type": "Rescue 1122 Fire Engine", "lat": inc_lat + 0.012, "lng": inc_lng - 0.008, "compat": ["FIRE", "NATURAL_HAZARD"]},
        {"id": "UNIT-R1122-AMB", "name": "Rescue 1122 Ambulance 204", "type": "Emergency Ambulance", "lat": inc_lat - 0.005, "lng": inc_lng + 0.009, "compat": ["MEDICAL", "FIRE"]},
        {"id": "UNIT-EDHI-115", "name": "Edhi Foundation Ambulance 115", "type": "Edhi Trauma Mobile", "lat": inc_lat + 0.015, "lng": inc_lng - 0.010, "compat": ["MEDICAL"]},
        {"id": "UNIT-POL-309", "name": "Islamabad Police Mobile 309", "type": "Police Eagle Squad", "lat": inc_lat + 0.007, "lng": inc_lng + 0.005, "compat": ["SECURITY", "NATURAL_HAZARD"]},
        {"id": "UNIT-R1122-DIS", "name": "Rescue 1122 Special Disaster Unit", "type": "Urban Search & Rescue", "lat": inc_lat - 0.018, "lng": inc_lng - 0.015, "compat": ["FIRE", "NATURAL_HAZARD", "MEDICAL"]}
    ]

    suggested_units: List[SuggestedUnit] = []

    for u in units_pool:
        dist = calculate_haversine(inc_lat, inc_lng, u["lat"], u["lng"])
        # Average emergency vehicle speed ~45 km/h in city traffic
        eta = max(2, int(round((dist / 45.0) * 60)))
        
        # Priority boost for matching category
        if category in u["compat"]:
            dist *= 0.8 # match weight bonus

        suggested_units.append(SuggestedUnit(
            unitId=u["id"],
            name=u["name"],
            unitType=u["type"],
            distanceKm=round(dist, 2),
            etaMinutes=eta,
            status="AVAILABLE"
        ))

    # Sort by nearest ETA
    suggested_units.sort(key=lambda x: x.etaMinutes)
    top_units = suggested_units[:3]

    reasoning = ReasoningStep(
        agentName="Agent 2 (Geospatial & Route Optimizer)",
        stepSummary=f"Identified {len(top_units)} optimal Pakistan emergency responder units.",
        details=f"Calculated spatial Haversine distances to incident grid [{inc_lat:.4f}, {inc_lng:.4f}]. Top response unit ETA: {top_units[0].etaMinutes} mins ({top_units[0].name}).",
        timestamp=datetime.utcnow().isoformat()
    )

    return {
        "suggested_units": top_units,
        "route_reasoning": reasoning
    }
