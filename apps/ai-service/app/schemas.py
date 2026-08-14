from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

SeverityLevel = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
IncidentCategory = Literal["FIRE", "MEDICAL", "SECURITY", "NATURAL_HAZARD"]

class LocationCoordinates(BaseModel):
    lng: float
    lat: float

class IncidentInput(BaseModel):
    incidentId: str
    rawPayload: str
    coordinates: List[float] = Field(..., description="[longitude, latitude]")
    source: str = "TELEMETRY_FEED"
    metadata: Optional[Dict[str, Any]] = None

class SuggestedUnit(BaseModel):
    unitId: str
    name: str
    unitType: str
    distanceKm: float
    etaMinutes: int
    status: str = "AVAILABLE"

class ActionStep(BaseModel):
    stepNumber: int
    action: str
    priority: Literal["URGENT", "HIGH", "ROUTINE"]
    assignedRole: str

class ReasoningStep(BaseModel):
    agentName: str
    stepSummary: str
    details: str
    timestamp: str

class IncidentAnalysisResult(BaseModel):
    incidentId: str
    category: IncidentCategory
    severity: SeverityLevel
    confidence: float
    summary: str
    suggestedUnits: List[SuggestedUnit]
    actionPlan: List[ActionStep]
    broadcastMessage: str
    reasoningTrace: List[ReasoningStep]
