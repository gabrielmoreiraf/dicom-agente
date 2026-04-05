import type { DiagnosisFormValues } from "@/schemas/diagnosis";

/**
 * Tipos centrais do domínio "diagnóstico" (local + fila de sync).
 * O Dexie persiste `DiagnosisRecord`; o formulário completo (incl. assinatura base64) vive em `payload`.
 *
 * Dados sensíveis: assinatura (`signature_data_url`) e demais campos do formulário podem identificar
 * pessoas e comunidades — exibir na UI apenas quando necessário; sincronizar só com API autenticada.
 */

export const DIAGNOSIS_STATUSES = [
  "draft",
  "completed",
  "pending_sync",
  "syncing",
  "synced",
  "sync_error",
] as const;

export type DiagnosisStatus = (typeof DIAGNOSIS_STATUSES)[number];

export interface DiagnosisRecord {
  local_id: string;
  server_id?: string;
  sync_version: number;
  status: DiagnosisStatus;
  created_at: string;
  updated_at: string;
  /** Soft delete — `null` = ativo */
  deleted_at: string | null;
  /** Preenchido enquanto POST está em voo (evita reenvio concorrente do mesmo registro) */
  sync_started_at: string | null;
  /** Formulário completo persistido localmente (inclui `signature_data_url` / canvas) */
  payload: DiagnosisFormValues;
  /** Título definido ao salvar rascunho (lista e identificação local). Limpa ao concluir. */
  draft_title?: string;
  sync_error?: string;
  /** Após a primeira conclusão (`draft` → `completed`), passa a ser `true`. */
  has_been_completed?: boolean;
  /**
   * Quantas vezes o diagnóstico foi concluído novamente após a primeira conclusão.
   * Máximo 2 edições pós-conclusão; em seguida apenas visualização.
   */
  post_completion_edits?: number;
}
