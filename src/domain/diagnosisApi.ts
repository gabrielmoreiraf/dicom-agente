import type { DiagnosisRecord } from "@/domain/diagnosis";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";

type RemoteApplyPatch = Pick<
  DiagnosisRecord,
  "server_id" | "sync_version" | "updated_at" | "status" | "sync_started_at"
> & { sync_error?: undefined };

/**
 * Contrato HTTP esperado para integração NestJS (ajuste paths/DTOs ao controller real).
 * Nomes alinhados a convenções comuns: body JSON + resposta com ids de servidor.
 *
 * LGPD: `payload` pode conter dados pessoais e `signature_data_url` (imagem) — tratar no backend
 * com controle de acesso, retenção e auditoria; não logar payload completo em produção.
 */

/** Corpo POST /diagnoses (ou equivalente) — idempotência via header `Idempotency-Key: local_id` */
export interface DiagnosisCreateRequestBody {
  local_id: string;
  /** Versão do cliente para detecção de conflito no servidor (opcional no backend) */
  client_sync_version: number;
  created_at: string;
  updated_at: string;
  /** Status no dispositivo (draft, completed, pending_sync, …) */
  status?: string;
  /** Snapshot completo do formulário (assinatura em `payload.signature_data_url`) */
  payload: DiagnosisFormValues;
}

export interface DiagnosisRemoteResponseBody {
  server_id: string;
  sync_version: number;
}

/** Mapeia registro local → payload enviado à API (sem metadados só de UI). */
export function mapDiagnosisRecordToApiRequest(
  record: DiagnosisRecord,
): DiagnosisCreateRequestBody {
  return {
    local_id: record.local_id,
    client_sync_version: record.sync_version,
    created_at: record.created_at,
    updated_at: record.updated_at,
    status: record.status,
    payload: record.payload,
  };
}

/** Campos a aplicar no Dexie após resposta 2xx da API */
export function applyRemoteSuccessToLocal(
  remote: DiagnosisRemoteResponseBody,
): RemoteApplyPatch {
  const now = new Date().toISOString();
  return {
    server_id: remote.server_id,
    sync_version: remote.sync_version,
    updated_at: now,
    status: "synced",
    sync_error: undefined,
    sync_started_at: null,
  };
}
