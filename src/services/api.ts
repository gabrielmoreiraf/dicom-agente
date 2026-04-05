import type { DiagnosisRecord } from "@/domain/diagnosis";
import {
  mapDiagnosisRecordToApiRequest,
  type DiagnosisRemoteResponseBody,
} from "@/domain/diagnosisApi";
import { getSession } from "@/features/auth/session";
import { apiUrl, useAgentApiMock } from "@/services/apiBase";

/**
 * Cliente HTTP para API NestJS — mock quando `useAgentApiMock()` (ver apiBase).
 * Idempotência: header `Idempotency-Key` = `local_id` (o backend deve deduplicar).
 */
export type { DiagnosisRemoteResponseBody as RemoteDiagnosisResponse };

export async function postDiagnosis(record: DiagnosisRecord): Promise<DiagnosisRemoteResponseBody> {
  if (!navigator.onLine) {
    throw new Error("Sem conexão");
  }
  const body = mapDiagnosisRecordToApiRequest(record);

  if (useAgentApiMock()) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      server_id: `srv-${record.local_id.slice(0, 8)}`,
      sync_version: Math.max(record.sync_version, 0) + 1,
    };
  }

  const session = await getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Idempotency-Key": record.local_id,
    Accept: "application/json",
  };
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(apiUrl("/diagnoses"), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<DiagnosisRemoteResponseBody>;
}

export async function healthCheck(): Promise<boolean> {
  if (useAgentApiMock()) return navigator.onLine;
  try {
    const r = await fetch(apiUrl("/health"), { method: "GET" });
    return r.ok;
  } catch {
    return false;
  }
}
