import { db } from "@/db";
import type { DiagnosisRecord, DiagnosisStatus } from "@/domain/diagnosis";
import { randomUUID } from "@/lib/randomUUID";
import { getDefaultDiagnosisValues, type DiagnosisFormValues } from "@/schemas/diagnosis";

/** Máximo de vezes que o agente pode concluir o formulário novamente após a primeira conclusão. */
export const MAX_POST_COMPLETION_EDITS = 2;

export async function createDraft(): Promise<string> {
  const local_id = randomUUID();
  const now = new Date().toISOString();
  const row: DiagnosisRecord = {
    local_id,
    sync_version: 0,
    status: "draft",
    created_at: now,
    updated_at: now,
    deleted_at: null,
    sync_started_at: null,
    payload: getDefaultDiagnosisValues(),
    has_been_completed: false,
    post_completion_edits: 0,
  };
  await db.diagnoses.add(row);
  return local_id;
}

export async function getDiagnosis(localId: string): Promise<DiagnosisRecord | undefined> {
  const row = await db.diagnoses.get(localId);
  if (!row || row.deleted_at) return undefined;
  return row;
}

export async function savePayload(
  localId: string,
  payload: DiagnosisFormValues,
  status: DiagnosisStatus,
  options?: { draftTitle?: string },
): Promise<void> {
  const prev = await db.diagnoses.get(localId);
  if (!prev || prev.deleted_at) throw new Error("Diagnóstico não encontrado");

  const hasBeenCompleted = prev.has_been_completed ?? false;
  const postEdits = prev.post_completion_edits ?? 0;

  if (hasBeenCompleted && postEdits >= MAX_POST_COMPLETION_EDITS) {
    throw new Error(
      "Limite de 2 edições após a conclusão atingido. Use apenas visualização.",
    );
  }

  const firstCompletion =
    prev.status === "draft" && status === "completed" && !hasBeenCompleted;

  let nextHasBeenCompleted = hasBeenCompleted;
  let nextPostEdits = postEdits;

  if (firstCompletion) {
    nextHasBeenCompleted = true;
    nextPostEdits = 0;
  } else if (status === "completed" && nextHasBeenCompleted) {
    nextPostEdits = postEdits + 1;
  }

  const draftTitleNext =
    status === "draft" && options?.draftTitle !== undefined
      ? options.draftTitle.trim() || undefined
      : status !== "draft"
        ? undefined
        : prev.draft_title;

  await db.diagnoses.update(localId, {
    payload,
    status,
    updated_at: new Date().toISOString(),
    sync_version: prev.sync_version + 1,
    has_been_completed: nextHasBeenCompleted,
    post_completion_edits: nextPostEdits,
    draft_title: draftTitleNext,
  });
}

/** Indica se o registro ainda pode ser alterado (salvar rascunho ou concluir). */
export function canEditDiagnosis(record: DiagnosisRecord): boolean {
  const hasBeenCompleted = record.has_been_completed ?? false;
  const postEdits = record.post_completion_edits ?? 0;
  if (!hasBeenCompleted) return true;
  return postEdits < MAX_POST_COMPLETION_EDITS;
}

/** Remove um rascunho do dispositivo. Diagnósticos já concluídos não podem ser excluídos aqui. */
export async function deleteDraftLocal(localId: string): Promise<void> {
  const row = await db.diagnoses.get(localId);
  if (!row || row.deleted_at) return;
  if (row.status !== "draft") {
    throw new Error("Só é possível excluir rascunhos (diagnósticos ainda não concluídos).");
  }
  await db.diagnoses.delete(localId);
}

/** Remove todos os rascunhos locais. Retorna quantos registros foram apagados. */
export async function deleteAllDraftsLocal(): Promise<number> {
  return db.diagnoses.where("status").equals("draft").delete();
}

export async function listDiagnoses(): Promise<DiagnosisRecord[]> {
  const rows = await db.diagnoses.orderBy("updated_at").reverse().toArray();
  return rows.filter((r) => !r.deleted_at);
}
