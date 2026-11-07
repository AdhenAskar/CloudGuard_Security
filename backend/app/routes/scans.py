from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.config import settings
from app.aws.connection import assumed_role_session
from app.aws.s3_scanner import scan_s3_buckets
from app.storage import save_scan, get_scan

router = APIRouter(tags=["scans"])

class ScanRequest(BaseModel):
    mode: str = Field(default="demo", pattern="^(demo|aws)$")
    region: str | None = Field(default=None, min_length=2, max_length=32)

@router.post("/scans/s3", status_code=201)
def start_s3_scan(request: ScanRequest):
    region = request.region or settings.aws_region
    try:
        if request.mode == "demo":
            findings = demo_findings()
            account_id = "DEMO-ACCOUNT"
        else:
            if not settings.aws_role_arn or not settings.aws_external_id:
                raise HTTPException(
                    status_code=409,
                    detail="AWS scanning is not configured. Set CLOUDGUARD_AWS_ROLE_ARN and CLOUDGUARD_AWS_EXTERNAL_ID on the backend.",
                )
            session = assumed_role_session(
                settings.aws_role_arn, settings.aws_external_id, region
            )
            sts = session.client("sts", region_name=region)
            account_id = sts.get_caller_identity()["Account"]
            s3 = session.client("s3", region_name=region)
            findings = scan_s3_buckets(s3, account_id=account_id)
        record = save_scan(mode=request.mode, account_id=account_id, region=region, findings=findings)
        return record
    except HTTPException:
        raise
    except Exception as exc:
        # Do not return AWS response bodies, credentials, or stack traces to clients.
        raise HTTPException(status_code=502, detail=f"S3 scan failed: {type(exc).__name__}") from exc

@router.get("/scans/{scan_id}")
def read_scan(scan_id: str):
    record = get_scan(scan_id)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    return record

def demo_findings():
    return [
        {
            "resource_type": "AWS::S3::Bucket",
            "resource_id": "demo-public-assets",
            "title": "S3 bucket may allow public access",
            "severity": "CRITICAL",
            "status": "OPEN",
            "description": "Illustrative demo finding only; no AWS account was scanned.",
            "recommendation": "Enable all S3 Block Public Access settings and review bucket policy and ACL.",
            "evidence": {"check": "public_access_block", "demo": True},
        },
        {
            "resource_type": "AWS::S3::Bucket",
            "resource_id": "demo-unencrypted-archive",
            "title": "Default server-side encryption is not configured",
            "severity": "HIGH",
            "status": "OPEN",
            "description": "Illustrative demo finding only; no AWS account was scanned.",
            "recommendation": "Configure default SSE-S3 or SSE-KMS encryption for the bucket.",
            "evidence": {"check": "default_encryption", "demo": True},
        },
    ]
