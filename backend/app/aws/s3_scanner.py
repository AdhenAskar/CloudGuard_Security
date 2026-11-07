from botocore.exceptions import ClientError

def _error_code(exc: ClientError) -> str:
    return exc.response.get("Error", {}).get("Code", "Unknown")

def _finding(bucket: str, title: str, severity: str, check: str, description: str, recommendation: str, evidence=None):
    return {
        "resource_type": "AWS::S3::Bucket",
        "resource_id": bucket,
        "title": title,
        "severity": severity,
        "status": "OPEN",
        "description": description,
        "recommendation": recommendation,
        "evidence": {"check": check, **(evidence or {})},
    }

def scan_s3_buckets(s3_client, account_id: str = "unknown") -> list[dict]:
    """
    Read-only S3 posture checks. Checks bucket-level public access block,
    default encryption, and versioning. Does not read object contents.
    AccessDenied/unsupported calls are reported as scan errors, not silently
    interpreted as insecure configuration.
    """
    findings = []
    response = s3_client.list_buckets()
    for item in response.get("Buckets", []):
        name = item["Name"]

        # Public access block: missing configuration is a genuine finding.
        try:
            pab = s3_client.get_public_access_block(Bucket=name)["PublicAccessBlockConfiguration"]
            required = ("BlockPublicAcls", "IgnorePublicAcls", "BlockPublicPolicy", "RestrictPublicBuckets")
            missing = [key for key in required if pab.get(key) is not True]
            if missing:
                findings.append(_finding(
                    name, "S3 Block Public Access is incomplete", "CRITICAL",
                    "public_access_block",
                    "One or more bucket-level Block Public Access controls are disabled.",
                    "Enable all four S3 Block Public Access settings and verify the effective account-level controls.",
                    {"disabled_controls": missing},
                ))
        except ClientError as exc:
            code = _error_code(exc)
            if code in ("NoSuchPublicAccessBlockConfiguration", "NoSuchPublicAccessBlock"):
                findings.append(_finding(
                    name, "S3 Block Public Access is not configured", "CRITICAL",
                    "public_access_block",
                    "No bucket-level S3 Block Public Access configuration was found.",
                    "Enable all four S3 Block Public Access settings. Also review account-level settings, bucket policy, and ACLs.",
                    {"aws_error": code},
                ))
            else:
                findings.append(_finding(
                    name, "Could not inspect S3 public access settings", "INFO",
                    "public_access_block", "AWS did not allow this configuration check to complete.",
                    "Grant s3:GetBucketPublicAccessBlock to the scanning role and rerun the scan.",
                    {"aws_error": code},
                ))

        # Default encryption.
        try:
            encryption = s3_client.get_bucket_encryption(Bucket=name).get("ServerSideEncryptionConfiguration", {})
            rules = encryption.get("Rules", [])
            if not rules:
                findings.append(_finding(
                    name, "Default bucket encryption is not configured", "HIGH",
                    "default_encryption",
                    "No default server-side encryption rule was returned for this bucket.",
                    "Configure default SSE-S3 or SSE-KMS encryption and assess existing objects separately.",
                ))
        except ClientError as exc:
            code = _error_code(exc)
            if code in ("ServerSideEncryptionConfigurationNotFoundError", "NoSuchEncryptionConfiguration"):
                findings.append(_finding(
                    name, "Default bucket encryption is not configured", "HIGH",
                    "default_encryption",
                    "No default server-side encryption configuration was found.",
                    "Configure default SSE-S3 or SSE-KMS encryption. This check does not inspect existing objects.",
                    {"aws_error": code},
                ))
            else:
                findings.append(_finding(
                    name, "Could not inspect default bucket encryption", "INFO",
                    "default_encryption",
                    "AWS did not allow this configuration check to complete.",
                    "Grant s3:GetEncryptionConfiguration to the scanning role and rerun the scan.",
                    {"aws_error": code},
                ))

        # Versioning: Suspended and never enabled both need attention.
        try:
            status = s3_client.get_bucket_versioning(Bucket=name).get("Status", "Disabled")
            if status != "Enabled":
                findings.append(_finding(
                    name, "S3 bucket versioning is not enabled", "MEDIUM",
                    "versioning",
                    f"Bucket versioning status is {status}.",
                    "Enable versioning for buckets where recovery from accidental deletion or overwrite is required.",
                    {"versioning_status": status},
                ))
        except ClientError as exc:
            findings.append(_finding(
                name, "Could not inspect bucket versioning", "INFO", "versioning",
                "AWS did not allow this configuration check to complete.",
                "Grant s3:GetBucketVersioning to the scanning role and rerun the scan.",
                {"aws_error": _error_code(exc)},
            ))
    return findings
