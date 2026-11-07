export interface BackendHealth {
  status: 'ok' | 'error';
  aws_role_configured: boolean;
  scan_modes: ('demo' | 'aws')[];
}

export interface BackendFinding {
  resource_type: string;
  resource_id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  status: string;
  description: string;
  recommendation: string;
  evidence: Record<string, unknown>;
}

export interface ScanResponse {
  id: string;
  created_at: string;
  mode: 'demo' | 'aws';
  account_id: string;
  region: string;
  summary: {
    total_findings: number;
    critical: number;
    high: number;
    medium: number;
    info: number;
  };
  findings: BackendFinding[];
}

const API_BASE = '/api';

export async function checkBackendHealth(): Promise<BackendHealth | null> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function runS3Scan(mode: 'demo' | 'aws' = 'demo', region?: string): Promise<ScanResponse> {
  const res = await fetch(`${API_BASE}/scans/s3`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, region }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Scan request failed with status ${res.status}`);
  }
  return await res.json();
}

export async function fetchScanResult(scanId: string): Promise<ScanResponse> {
  const res = await fetch(`${API_BASE}/scans/${scanId}`);
  if (!res.ok) throw new Error(`Failed to load scan ${scanId}`);
  return await res.json();
}

