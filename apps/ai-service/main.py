import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.analyze import router as analyze_router

app = FastAPI(
    title="Real-Time Ops Center - AI Agent Microservice",
    description="Multi-agent incident triage, geospatial routing, and operational action planner",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api/v1", tags=["Incident Analysis"])

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "service": "ai-service", "provider": settings.AI_MODEL_PROVIDER}

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
