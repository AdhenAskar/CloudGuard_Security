import boto3
from botocore.config import Config

def assumed_role_session(role_arn: str, external_id: str, region: str):
    """Create short-lived AWS credentials by assuming the configured read-only role."""
    sts = boto3.client(
        "sts",
        region_name=region,
        config=Config(retries={"max_attempts": 4, "mode": "standard"}),
    )
    response = sts.assume_role(
        RoleArn=role_arn,
        RoleSessionName="CloudGuardSMEReadOnlyScan",
        ExternalId=external_id,
        DurationSeconds=900,
    )
    credentials = response["Credentials"]
    return boto3.Session(
        aws_access_key_id=credentials["AccessKeyId"],
        aws_secret_access_key=credentials["SecretAccessKey"],
        aws_session_token=credentials["SessionToken"],
        region_name=region,
    )
