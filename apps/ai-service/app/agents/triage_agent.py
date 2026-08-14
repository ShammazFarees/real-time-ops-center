from datetime import datetime
import json
from app.schemas import IncidentInput, SeverityLevel, IncidentCategory, ReasoningStep
from app.config import settings

def run_triage_agent(input_data: IncidentInput) -> dict:
    raw_text = input_data.rawPayload.lower()
    
    category: IncidentCategory = "SECURITY"
    severity: SeverityLevel = "MEDIUM"
    confidence: float = 0.88
    
    if any(word in raw_text for word in ["fire", "explosion", "smoke", "blaze", "inferno"]):
        category = "FIRE"
        severity = "CRITICAL" if any(w in raw_text for w in ["trapped", "massive", "explosion", "building", "structural"]) else "HIGH"
        confidence = 0.95
    elif any(word in raw_text for word in ["cardiac", "unconscious", "injury", "medical", "blood", "ambulance", "fall", "overdose"]):
        category = "MEDICAL"
        severity = "CRITICAL" if any(w in raw_text for w in ["unconscious", "cardiac", "severe", "fatal", "mass casualty"]) else "HIGH"
        confidence = 0.92
    elif any(word in raw_text for word in ["flood", "earthquake", "storm", "landslide", "tsunami", "hazard"]):
        category = "NATURAL_HAZARD"
        severity = "HIGH" if "severe" in raw_text or "collapse" in raw_text else "MEDIUM"
        confidence = 0.90
    elif any(word in raw_text for word in ["gunshot", "robbery", "active shooter", "intruder", "hostage", "assault"]):
        category = "SECURITY"
        severity = "CRITICAL" if any(w in raw_text for w in ["shooter", "gunshot", "weapon", "hostage"]) else "HIGH"
        confidence = 0.96

    reasoning = ReasoningStep(
        agentName="Agent 1 (Triage & Classifier)",
        stepSummary=f"Categorized as {category} with {severity} severity.",
        details=f"Analyzed input signals. Extracted key indicators from payload string. Assigned confidence {confidence * 100:.0f}%.",
        timestamp=datetime.utcnow().isoformat()
    )

    return {
        "category": category,
        "severity": severity,
        "confidence": confidence,
        "triage_reasoning": reasoning
    }
