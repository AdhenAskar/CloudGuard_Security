from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["health"])

@router.get("/health")
def health():
    return {
        "status": "ok",
        "aws_role_configured": bool(settings.aws_role_arn and settings.aws_external_id),
        "scan_modes": ["demo"] + (["aws"] if settings.aws_role_arn and settings.aws_external_id else []),
    }
