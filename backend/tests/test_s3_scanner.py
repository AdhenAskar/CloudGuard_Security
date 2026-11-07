from app.aws.s3_scanner import scan_s3_buckets

class FakeS3:
    def list_buckets(self):
        return {"Buckets": [{"Name": "example-bucket"}]}
    def get_public_access_block(self, Bucket):
        return {"PublicAccessBlockConfiguration": {
            "BlockPublicAcls": True, "IgnorePublicAcls": False,
            "BlockPublicPolicy": True, "RestrictPublicBuckets": True
        }}
    def get_bucket_encryption(self, Bucket):
        return {"ServerSideEncryptionConfiguration": {"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}}
    def get_bucket_versioning(self, Bucket):
        return {"Status": "Suspended"}

def test_detects_disabled_public_access_control_and_suspended_versioning():
    findings = scan_s3_buckets(FakeS3(), account_id="123456789012")
    checks = {finding["evidence"]["check"] for finding in findings}
    assert "public_access_block" in checks
    assert "versioning" in checks
    assert any(f["severity"] == "CRITICAL" for f in findings)
    assert any("versioning" in f["title"].lower() for f in findings)
