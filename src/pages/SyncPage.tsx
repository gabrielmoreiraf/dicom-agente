import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { db } from "@/db";
import { deleteAllDraftsLocal } from "@/features/diagnoses/services/diagnosisService";
import { syncPendingDiagnoses } from "@/features/diagnoses/services/syncService";
import styles from "./SyncPage.module.css";

/** Remove rascunhos e cache local. Não altera sessão — use antes de descomissionar o aparelho. */
async function clearLocalOperationalData(): Promise<void> {
  await db.diagnoses.clear();
  await db.comunidades_cache.clear();
}

export function SyncPage() {
  const qc = useQueryClient();
  const [wipeConfirm, setWipeConfirm] = useState("");
  const [deleteAllDraftsOpen, setDeleteAllDraftsOpen] = useState(false);
  const pending = useLiveQuery(async () => {
    const rows = await db.diagnoses.toArray();
    return rows.filter(
      (r) => !r.deleted_at && (r.status === "pending_sync" || r.status === "syncing")
    ).length;
  }, []);
  const errors = useLiveQuery(async () => {
    const rows = await db.diagnoses.toArray();
    return rows.filter((r) => !r.deleted_at && r.status === "sync_error").length;
  }, []);

  const syncMut = useMutation({
    mutationFn: syncPendingDiagnoses,
    onSuccess: () => void qc.invalidateQueries(),
  });

  const wipeMut = useMutation({
    mutationFn: clearLocalOperationalData,
    onSuccess: () => void qc.invalidateQueries(),
  });

  const deleteDraftsMut = useMutation({
    mutationFn: deleteAllDraftsLocal,
    onSuccess: () => void qc.invalidateQueries(),
  });

  const canWipe =
    wipeConfirm.trim().toUpperCase() === "APAGAR" && !wipeMut.isPending;

  return (
    <div className={styles.root}>
      <div>
        <h1 className={styles.title}>Sincronização</h1>
        <p className={styles.sub}>
          Envio seguro para o repositório institucional — apenas pendentes de sincronização.
        </p>
      </div>
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={`${styles.iconWrap} ${styles.iconPrimary}`}>
            <CloudUploadOutlined sx={{ fontSize: 24 }} />
          </div>
          <div className={`${styles.bigNum} ${styles.bigNumPrimary}`}>{pending ?? 0}</div>
          <div className={styles.cardLabel}>Pendentes</div>
        </div>
        <div className={styles.card}>
          <div className={`${styles.iconWrap} ${styles.iconAmber}`}>
            <ErrorOutlineOutlined sx={{ fontSize: 24 }} />
          </div>
          <div className={`${styles.bigNum} ${styles.bigNumAmber}`}>{errors ?? 0}</div>
          <div className={styles.cardLabel}>Com erro</div>
        </div>
      </div>
      <button
        type="button"
        disabled={syncMut.isPending}
        onClick={() => syncMut.mutate()}
        className={styles.btnSync}
      >
        {syncMut.isPending ? "Sincronizando…" : "Sincronizar tudo"}
      </button>
      {syncMut.data && (
        <p className={styles.result}>
          Enviados: {syncMut.data.synced}
          {syncMut.data.errors.length > 0 && ` · Falhas: ${syncMut.data.errors.length}`}
        </p>
      )}

      <section className={styles.sectionAmber}>
        <h2 className={styles.sectionTitle}>Rascunhos</h2>
        <p className={styles.sectionText}>
          Remove do aparelho todos os diagnósticos ainda em <strong>rascunho</strong> (não concluídos).
          Não afeta registros já concluídos ou sincronizados.
        </p>
        <button
          type="button"
          disabled={deleteDraftsMut.isPending}
          onClick={() => setDeleteAllDraftsOpen(true)}
          className={styles.btnDraft}
        >
          {deleteDraftsMut.isPending
            ? "Removendo…"
            : "Apagar todos os rascunhos"}
        </button>
        {deleteDraftsMut.isSuccess && typeof deleteDraftsMut.data === "number" ? (
          <p className={styles.feedback}>
            {deleteDraftsMut.data === 0
              ? "Nenhum rascunho para remover."
              : `${deleteDraftsMut.data} rascunho(s) removido(s).`}
          </p>
        ) : null}
      </section>

      <section className={styles.sectionRed}>
        <h2 className={styles.sectionTitle}>Privacidade e dispositivo</h2>
        <p className={styles.sectionText}>
          Para encerrar ou repassar o aparelho, apague os diagnósticos e o cache local. A sessão
          (login) não é removida aqui — use <strong>Sair</strong> no menu.
        </p>
        <label className={styles.labelBlock}>
          Digite <span className={styles.mono}>APAGAR</span> para confirmar
          <input
            type="text"
            value={wipeConfirm}
            onChange={(e) => setWipeConfirm(e.target.value)}
            className={styles.input}
            autoComplete="off"
            placeholder="APAGAR"
          />
        </label>
        <button
          type="button"
          disabled={!canWipe}
          onClick={() => wipeMut.mutate()}
          className={styles.btnWipe}
        >
          {wipeMut.isPending ? "Removendo…" : "Apagar diagnósticos e cache deste dispositivo"}
        </button>
        {wipeMut.isSuccess ? (
          <p className={styles.success}>Dados locais removidos.</p>
        ) : null}
      </section>

      <ConfirmDialog
        open={deleteAllDraftsOpen}
        onOpenChange={setDeleteAllDraftsOpen}
        title="Apagar todos os rascunhos"
        description="Todos os diagnósticos ainda em rascunho serão removidos só deste aparelho. Registros já concluídos não são afetados."
        confirmLabel="Apagar rascunhos"
        danger
        onConfirm={async () => {
          await deleteDraftsMut.mutateAsync();
        }}
      />
    </div>
  );
}
