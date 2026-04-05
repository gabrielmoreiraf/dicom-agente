import Add from "@mui/icons-material/Add";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "@/db";
import { HomeIntro } from "@/components/home/HomeIntro";
import { DraftsInfoDialog } from "@/features/diagnoses/components/DraftsInfoDialog";
import { syncPendingDiagnoses } from "@/features/diagnoses/services/syncService";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import styles from "./HomePage.module.css";

export function HomePage() {
  const nav = useNavigate();
  const online = useOnlineStatus();
  const qc = useQueryClient();
  const [draftsInfoOpen, setDraftsInfoOpen] = useState(false);

  const stats = useLiveQuery(async () => {
    const rows = (await db.diagnoses.toArray()).filter((r) => !r.deleted_at);
    return {
      drafts: rows.filter((r) => r.status === "draft").length,
      pending:
        rows.filter((r) => r.status === "pending_sync").length +
        rows.filter((r) => r.status === "syncing").length,
      errors: rows.filter((r) => r.status === "sync_error").length,
      synced: rows.filter((r) => r.status === "synced").length,
      completed: rows.filter((r) => r.status === "completed").length,
    };
  }, []);

  const syncMut = useMutation({
    mutationFn: syncPendingDiagnoses,
    onSuccess: () => void qc.invalidateQueries(),
  });

  return (
    <div className={styles.root}>
      <div className={styles.pageIntro}>
        <HomeIntro />
      </div>

      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.heroInner}>
          <p className={styles.heroKicker}>Campanha ativa</p>
          <h2 className={styles.heroTitle}>Mapeamento Rural 2026 — Fase 1</h2>
          <p className={styles.heroDesc}>
            Coleta produtiva, social, ambiental e organizacional nas comunidades.
          </p>
          <span className={styles.badge}>Em andamento</span>
        </div>
      </section>

      <div className={styles.stats}>
        <button
          type="button"
          className={styles.statCardButton}
          onClick={() => setDraftsInfoOpen(true)}
        >
          <div className={styles.statValue}>{stats?.drafts ?? 0}</div>
          <div className={styles.statLabel}>Rascunhos</div>
        </button>
        <Stat label="Pend. sync" value={stats?.pending ?? 0} />
        <Stat label="Sincronizados" value={stats?.synced ?? 0} />
      </div>

      <DraftsInfoDialog open={draftsInfoOpen} onOpenChange={setDraftsInfoOpen} />

      <button
        type="button"
        onClick={() => nav("/diagnostico/novo")}
        className={styles.cta}
      >
        <span className={styles.ctaSheen} aria-hidden />
        <span className={styles.ctaIcon} aria-hidden>
          <Add sx={{ fontSize: 30 }} />
        </span>
        <span className={styles.ctaCopy}>
          <span className={styles.ctaTitle}>Novo diagnóstico</span>
          <span className={styles.ctaSub}>Iniciar registro de campo na comunidade</span>
        </span>
      </button>

      <div className={styles.row}>
        <Link to="/diagnosticos" className={styles.linkPrimary}>
          Ver diagnósticos
        </Link>
        <button
          type="button"
          disabled={syncMut.isPending || !online}
          onClick={() => syncMut.mutate()}
          className={styles.btnNeutral}
        >
          {syncMut.isPending ? "Sincronizando…" : "Sincronizar agora"}
        </button>
      </div>

      {syncMut.data && (
        <p className={styles.syncResult}>
          Sincronizados: {syncMut.data.synced}
          {syncMut.data.errors.length > 0 && ` · Erros: ${syncMut.data.errors.length}`}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
