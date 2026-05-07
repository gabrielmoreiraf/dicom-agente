import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { DiagnosisStatus } from "@/db";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { db } from "@/db";
import {
  canEditDiagnosis,
  deleteDraftLocal,
  MAX_POST_COMPLETION_EDITS,
} from "@/features/diagnoses/services/diagnosisService";
import {
  queueDiagnosisSync,
  syncPendingDiagnoses,
} from "@/features/diagnoses/services/syncService";
import styles from "./DiagnosesListPage.module.css";

const statusLabel: Record<DiagnosisStatus, string> = {
  draft: "Rascunho",
  completed: "Concluído",
  pending_sync: "Pendente sync",
  syncing: "Enviando…",
  synced: "Sincronizado",
  sync_error: "Erro sync",
};

export function DiagnosesListPage() {
  const qc = useQueryClient();
  const [deleteDraftId, setDeleteDraftId] = useState<string | null>(null);
  const rows = useLiveQuery(async () => {
    const all = await db.diagnoses.orderBy("updated_at").reverse().toArray();
    return all.filter((r) => !r.deleted_at);
  }, []);

  const queueMut = useMutation({
    mutationFn: async (localId: string) => {
      const row = await db.diagnoses.get(localId);
      if (row?.status === "completed" || row?.status === "sync_error") {
        await queueDiagnosisSync(localId);
      }
      return syncPendingDiagnoses();
    },
    onSuccess: () => void qc.invalidateQueries(),
  });

  const deleteDraftMut = useMutation({
    mutationFn: deleteDraftLocal,
    onSuccess: () => void qc.invalidateQueries(),
  });

  return (
    <div className={styles.root}>
      <div>
        <h1 className={styles.title}>Diagnósticos</h1>
        <p className={styles.sub}>
          Controle de registros de campo e sincronização de dados.
        </p>
      </div>
      <p className={styles.info}>
        Rascunhos podem ser excluídos. Após concluir um diagnóstico, você pode
        editar no máximo {MAX_POST_COMPLETION_EDITS} vezes; depois, apenas
        visualizar.
      </p>
      <div className={styles.list}>
        {rows?.map((r) => {
          const editable = canEditDiagnosis(r);
          const editsUsed = r.post_completion_edits ?? 0;
          const cardHeading =
            r.status === "draft" && r.draft_title?.trim()
              ? r.draft_title.trim()
              : r.payload.comunidade || "Sem comunidade";
          return (
            <div key={r.local_id} className={styles.card}>
              <div>
                <div className={styles.cardTitle}>{cardHeading}</div>
                <div className={styles.cardMeta}>
                  {r.payload.data_coleta || "—"}
                </div>
                <span className={styles.badge}>{statusLabel[r.status]}</span>
                {r.has_been_completed ? (
                  <p className={styles.meta}>
                    Edições após conclusão: {editsUsed}/
                    {MAX_POST_COMPLETION_EDITS}
                    {!editable ? " · somente leitura" : ""}
                  </p>
                ) : null}
                {r.sync_error && <p className={styles.err}>{r.sync_error}</p>}
              </div>
              <div className={styles.actions}>
                {r.status === "draft" && (
                  <button
                    type="button"
                    disabled={deleteDraftMut.isPending}
                    onClick={() => setDeleteDraftId(r.local_id)}
                    className={styles.btnDelete}
                  >
                    Excluir
                  </button>
                )}
                <Link
                  to={`/diagnostico/${r.local_id}?visualizar=1`}
                  className={styles.linkView}
                >
                  Visualizar
                </Link>
                {editable ? (
                  <Link
                    to={`/diagnostico/${r.local_id}`}
                    className={styles.linkEdit}
                  >
                    Editar
                  </Link>
                ) : null}
                {(r.status === "completed" ||
                  r.status === "sync_error" ||
                  r.status === "pending_sync" ||
                  r.status === "syncing") && (
                  <button
                    type="button"
                    disabled={queueMut.isPending}
                    onClick={() => queueMut.mutate(r.local_id)}
                    className={styles.btnSync}
                  >
                    Sincronizar
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {!rows?.length && (
          <p className={styles.empty}>Nenhum diagnóstico ainda.</p>
        )}
      </div>

      <ConfirmDialog
        open={deleteDraftId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteDraftId(null);
        }}
        title="Excluir rascunho"
        description="Este rascunho será removido só deste aparelho. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={async () => {
          if (deleteDraftId) await deleteDraftMut.mutateAsync(deleteDraftId);
        }}
      />
    </div>
  );
}
