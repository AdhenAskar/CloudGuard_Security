# CloudGuard SME backend (MVP)

This backend adds a first S3 posture scanner to the existing React/Vite frontend. It uses FastAPI, Boto3, and SQLite so no database service is required for the first prototype.

## 1. Run locally (no AWS account required)

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs`, then run `POST /api/scans/s3` with:

```json
{"mode":"demo"}
```

This returns clearly labelled illustrative demo findings. It does **not** contact AWS.

## 2. Enable a real AWS scan later

The real scanner is deliberately disabled until backend environment variables are configured:

- `CLOUDGUARD_AWS_ROLE_ARN`: ARN of a customer-created cross-account read-only IAM role.
- `CLOUDGUARD_AWS_EXTERNAL_ID`: unique external ID used in the role trust policy.
- `CLOUDGUARD_AWS_REGION`: region for STS/client initialization.

Then call `POST /api/scans/s3` with `{"mode":"aws"}`. The backend uses STS `AssumeRole` and temporary credentials. No static AWS keys are accepted by the API and no credentials are sent to the browser.

**Do not deploy with a broad role trust policy.** Restrict the role trust relationship to the backend's AWS principal and require the external ID. Keep the role ARN/external ID in backend secrets, never in Vite `VITE_*` variables. For a multi-customer deployment, store each tenant's role configuration securely and enforce tenant authorization before adding customer-specific role selection.

## 3. Read-only IAM permissions

The assumed role needs only these S3 read permissions for this initial scanner, plus `sts:GetCallerIdentity` for account identification:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:ListAllMyBuckets",
      "s3:GetBucketPublicAccessBlock",
      "s3:GetEncryptionConfiguration",
      "s3:GetBucketVersioning"
    ],
    "Resource": "*"
  }]
}
```

No bucket/object write or delete permissions are used. This first version checks bucket-level Block Public Access, default encryption configuration, and versioning. It does not inspect object contents, prove that a bucket is publicly reachable, or evaluate every account-level policy/ACL interaction. Treat results as posture indicators, not a compliance certification.

## 4. API

- `GET /api/health` – service and AWS configuration status.
- `POST /api/scans/s3` – start a demo or configured AWS S3 scan.
- `GET /api/scans/{scan_id}` – retrieve a saved scan.

Scans are persisted to local SQLite at `./data/cloudguard.db` by default. Set `CLOUDGUARD_DB_PATH` to change the path.

## 5. Frontend

The existing frontend is preserved unchanged. During local development, run it separately with its normal Vite commands and configure its API base URL in a future integration step. The current dashboard still contains demo data; it will not automatically display backend scan results until the UI is connected to these endpoints.

## 6. Important production work still required

Authentication, tenant isolation, audit logging, rate limiting, background scan jobs, secure per-tenant role configuration, deployment secrets, and automated tests against a controlled AWS test account are not included yet. Keep this API private until authentication and authorization are implemented.
