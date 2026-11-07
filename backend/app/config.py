import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

def _csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]

@dataclass(frozen=True)
class Settings:
    aws_role_arn: str | None = os.getenv("CLOUDGUARD_AWS_ROLE_ARN") or None
    aws_external_id: str | None = os.getenv("CLOUDGUARD_AWS_EXTERNAL_ID") or None
    aws_region: str = os.getenv("CLOUDGUARD_AWS_REGION", "ap-south-1")
    db_path: str = os.getenv("CLOUDGUARD_DB_PATH", "./data/cloudguard.db")
    cors_origins: list[str] = None

settings = Settings(cors_origins=_csv(os.getenv("CLOUDGUARD_CORS_ORIGINS", "http://localhost:5173")))
