import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    AI_MODEL_PROVIDER: str = os.getenv("AI_MODEL_PROVIDER", "mock")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
