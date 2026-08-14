from datetime import datetime
from typing import List
from app.schemas import IncidentInput, ActionStep, SuggestedUnit, SeverityLevel, IncidentCategory, ReasoningStep

def run_action_agent(
    input_data: IncidentInput,
    category: IncidentCategory,
    severity: SeverityLevel,
    units: List[SuggestedUnit]
) -> dict:
    
    lead_unit = units[0].name if units else "Nearest Unit"
    
    summary = f"[{severity} {category}] {input_data.rawPayload[:120]}..."
    
    action_plan: List[ActionStep] = []
    
    if category == "FIRE":
        action_plan = [
            ActionStep(stepNumber=1, action=f"Dispatch {lead_unit} immediately under emergency lights & sirens.", priority="URGENT", assignedRole="Dispatcher"),
            ActionStep(stepNumber=2, action="Establish 200-meter safety perimeter and notify local power utility.", priority="HIGH", assignedRole="On-Scene Commander"),
            ActionStep(stepNumber=3, action="Stage secondary EMS unit for potential smoke inhalation treatment.", priority="HIGH", assignedRole="Medical Coordinator"),
            ActionStep(stepNumber=4, action="Conduct continuous thermal camera sweep for structural integrity.", priority="ROUTINE", assignedRole="Fire Captain")
        ]
    elif category == "MEDICAL":
        action_plan = [
            ActionStep(stepNumber=1, action=f"Route {lead_unit} with ALS (Advanced Life Support) package.", priority="URGENT", assignedRole="EMS Dispatch"),
            ActionStep(stepNumber=2, action="Provide pre-arrival CPR / trauma instructions to caller.", priority="URGENT", assignedRole="Telecommunicator"),
            ActionStep(stepNumber=3, action="Alert Trauma Center Emergency Department for incoming critical patient.", priority="HIGH", assignedRole="Triage Nurse"),
            ActionStep(stepNumber=4, action="Log vital stats stream upon arrival on scene.", priority="ROUTINE", assignedRole="Paramedic Lead")
        ]
    elif category == "SECURITY":
        action_plan = [
            ActionStep(stepNumber=1, action=f"Dispatch {lead_unit} to secure location and establish containment.", priority="URGENT", assignedRole="Police Dispatch"),
            ActionStep(stepNumber=2, action="Issue tactical situational awareness update to responding field officers.", priority="HIGH", assignedRole="Duty Sergeant"),
            ActionStep(stepNumber=3, action="Review nearby CCTV traffic feed for suspect vehicle / egress route.", priority="HIGH", assignedRole="Intel Analyst"),
            ActionStep(stepNumber=4, action="File initial incident audit log in central CAD database.", priority="ROUTINE", assignedRole="Records Officer")
        ]
    else: # NATURAL_HAZARD
        action_plan = [
            ActionStep(stepNumber=1, action="Issue regional public emergency warning signal.", priority="URGENT", assignedRole="Emergency Manager"),
            ActionStep(stepNumber=2, action=f"Deploy {lead_unit} for search & rescue reconnaissance.", priority="HIGH", assignedRole="Search Lead"),
            ActionStep(stepNumber=3, action="Coordinate road closures with municipal transit authority.", priority="HIGH", assignedRole="Traffic Control"),
            ActionStep(stepNumber=4, action="Activate emergency shelter staging location.", priority="ROUTINE", assignedRole="Logistics Lead")
        ]

    broadcast = (
        f"FLASH BROADCAST [{severity}] - {category} INCIDENT DETECTED.\n"
        f"Location: [{input_data.coordinates[1]:.4f}, {input_data.coordinates[0]:.4f}]\n"
        f"Assigned Primary Unit: {lead_unit} (ETA {units[0].etaMinutes if units else 5} min).\n"
        f"Mandatory Action: Proceed with Level-1 Precautionary Protocols."
    )

    reasoning = ReasoningStep(
        agentName="Agent 3 (Summarizer & Action Planner)",
        stepSummary="Generated incident summary, 4-step tactical checklist, and emergency broadcast payload.",
        details=f"Synthesized input parameters and assigned roles ({', '.join([a.assignedRole for a in action_plan[:2]])}).",
        timestamp=datetime.utcnow().isoformat()
    )

    return {
        "summary": summary,
        "action_plan": action_plan,
        "broadcast_message": broadcast,
        "action_reasoning": reasoning
    }
