from fastapi import APIRouter, HTTPException, status
from app.schemas import IncidentInput, IncidentAnalysisResult
from app.workflow import orchestrator

router = APIRouter()

@router.post("/analyze-incident", response_model=IncidentAnalysisResult, status_code=status.HTTP_200_OK)
async def analyze_incident(payload: IncidentInput):
    try:
        result = await orchestrator.execute_workflow(payload)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute multi-agent incident analysis workflow: {str(e)}"
        )
