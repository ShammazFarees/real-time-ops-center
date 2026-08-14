from typing import List, Dict, Any
from app.schemas import IncidentInput, IncidentAnalysisResult, ReasoningStep
from app.agents.triage_agent import run_triage_agent
from app.agents.route_agent import run_route_agent
from app.agents.action_agent import run_action_agent

class MultiAgentOrchestrator:
    def __init__(self):
        pass

    async def execute_workflow(self, input_data: IncidentInput) -> IncidentAnalysisResult:
        # Step 1: Agent 1 - Triage & Classifier
        triage_res = run_triage_agent(input_data)
        category = triage_res["category"]
        severity = triage_res["severity"]
        confidence = triage_res["confidence"]
        triage_reasoning: ReasoningStep = triage_res["triage_reasoning"]

        # Step 2: Agent 2 - Geospatial & Route Optimizer
        route_res = run_route_agent(input_data, category)
        suggested_units = route_res["suggested_units"]
        route_reasoning: ReasoningStep = route_res["route_reasoning"]

        # Step 3: Agent 3 - Summarizer & Action Planner
        action_res = run_action_agent(input_data, category, severity, suggested_units)
        summary = action_res["summary"]
        action_plan = action_res["action_plan"]
        broadcast_msg = action_res["broadcast_message"]
        action_reasoning: ReasoningStep = action_res["action_reasoning"]

        # Compile Reasoning Trace
        reasoning_trace = [triage_reasoning, route_reasoning, action_reasoning]

        return IncidentAnalysisResult(
            incidentId=input_data.incidentId,
            category=category,
            severity=severity,
            confidence=confidence,
            summary=summary,
            suggestedUnits=suggested_units,
            actionPlan=action_plan,
            broadcastMessage=broadcast_msg,
            reasoningTrace=reasoning_trace
        )

orchestrator = MultiAgentOrchestrator()
