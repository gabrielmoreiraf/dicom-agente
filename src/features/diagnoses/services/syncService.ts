import { db } from "@/db";
import type { DiagnosisRecord } from "@/domain/diagnosis";
import { applyRemoteSuccessToLocal } from "@/domain/diagnosisApi";
import { postDiagnosis } from "@/services/api";

export interface SyncResult {
  synced: number;
  errors: { local_id: string; message: string }[];
}

const STALE_SYNC_MS = 15 * 60 * 1000;

/** Encadeia sincronizações para não disparar POSTs duplicados do mesmo lógica em paralelo */
let syncMutex: Promise<unknown> = Promise.resolve();

/** Recupera registros presos em `syncing` após crash / fechamento do app durante o POST */
export async function recoverStaleSyncing(): Promise<void> {
  const now = Date.now();
  const stuck = await db.diagnoses.where("status").equals("syncing").toArray();
  for (const row of stuck) {
    const started = row.sync_started_at ? new Date(row.sync_started_at).getTime() : 0;
    if (!started || now - started > STALE_SYNC_MS) {
      await db.diagnoses.update(row.local_id, {
        status: "pending_sync",
        sync_started_at: null,
        sync_error: "Sincronização interrompida. Tente novamente.",
        updated_at: new Date().toISOString(),
      });
    }
  }
}

async function claimPendingForSync(localId: string): Promise<DiagnosisRecord | null> {
  let out: DiagnosisRecord | null = null;
  await db.transaction("rw", db.diagnoses, async () => {
    const row = await db.diagnoses.get(localId);
    if (!row || row.deleted_at || row.status !== "pending_sync") return;
    const started = new Date().toISOString();
    await db.diagnoses.update(localId, {
      status: "syncing",
      sync_started_at: started,
      sync_error: undefined,
      updated_at: started,
    });
    const fresh = await db.diagnoses.get(localId);
    if (fresh) out = fresh;
  });
  return out;
}

async function runSyncPendingDiagnoses(): Promise<SyncResult> {
  await recoverStaleSyncing();

  const pending = await db.diagnoses.where("status").equals("pending_sync").toArray();
  const active = pending.filter((r) => !r.deleted_at);
  const errors: SyncResult["errors"] = [];
  let synced = 0;

  for (const row of active) {
    const claimed = await claimPendingForSync(row.local_id);
    if (!claimed) continue;

    try {
      const remote = await postDiagnosis(claimed);
      const patch = applyRemoteSuccessToLocal(remote);
      await db.diagnoses.update(claimed.local_id, patch);
      synced += 1;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await db.diagnoses.update(claimed.local_id, {
        status: "sync_error",
        sync_error: message,
        sync_started_at: null,
        updated_at: new Date().toISOString(),
      });
      errors.push({ local_id: claimed.local_id, message });
    }
  }

  return { synced, errors };
}

/**
 * Envia apenas `pending_sync` (POST por registro; estado intermediário `syncing`).
 * Chamadas concorrentes são serializadas para evitar duplicação de envio.
 */
export async function syncPendingDiagnoses(): Promise<SyncResult> {
  const result = syncMutex.then(() => runSyncPendingDiagnoses());
  syncMutex = result.then(() => {}).catch(() => {});
  return result;
}

export async function retryOne(localId: string): Promise<void> {
  const row = await db.diagnoses.get(localId);
  if (!row || row.deleted_at || row.status !== "sync_error") return;
  await db.diagnoses.update(localId, {
    status: "pending_sync",
    sync_error: undefined,
    sync_started_at: null,
    updated_at: new Date().toISOString(),
  });
  await syncPendingDiagnoses();
}

export async function queueDiagnosisSync(localId: string): Promise<void> {
  const row = await db.diagnoses.get(localId);
  if (!row || row.deleted_at) return;
  await db.diagnoses.update(localId, {
    status: "pending_sync",
    updated_at: new Date().toISOString(),
    sync_error: undefined,
    sync_started_at: null,
  });
}
