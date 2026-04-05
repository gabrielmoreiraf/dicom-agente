import Dexie, { type Table } from "dexie";
import type { DiagnosisRecord } from "@/domain/diagnosis";
import type { ComunidadeItem } from "@/domain/comunidades";

export type { DiagnosisRecord, DiagnosisStatus } from "@/domain/diagnosis";

/** Metadados do cache do catálogo de comunidades (um registro fixo). */
export interface CatalogMetaRecord {
  id: "comunidades_catalog";
  catalog_fetched_at: string | null;
}

/**
 * IndexedDB via Dexie — fonte de verdade local (offline-first).
 * v2: soft delete (`deleted_at`), `sync_started_at`, catálogo de comunidades em cache.
 *
 * LGPD / segurança: dados em claro no dispositivo (JWT, payloads com possíveis dados pessoais e
 * assinatura em base64). Proteção depende do controle físico do aparelho; ofereça limpeza local
 * (ex.: tela de sincronização) antes de descomissionar o dispositivo.
 */
/** Sessão do agente (CPF + JWT + perfil). v3 remove e-mail. */
export interface SessionRecord {
  id: "current";
  access_token: string;
  cpf: string;
  /** JSON serializado de `AuthUser` */
  user_json: string;
  updated_at: string;
}

export class DiagnosticoDB extends Dexie {
  diagnoses!: Table<DiagnosisRecord, string>;
  session!: Table<SessionRecord, string>;
  comunidades_cache!: Table<ComunidadeItem, string>;
  catalog_meta!: Table<CatalogMetaRecord, string>;

  constructor() {
    super("diagnostico_comunidades_v1");
    this.version(1).stores({
      diagnoses: "local_id, status, server_id, updated_at",
      session: "id",
    });
    this.version(2)
      .stores({
        diagnoses:
          "local_id, status, server_id, updated_at, deleted_at, sync_started_at",
        session: "id",
        comunidades_cache: "id",
      })
      .upgrade(async (tx) => {
        const t = tx.table("diagnoses");
        await t.toCollection().modify((r: Record<string, unknown>) => {
          r.deleted_at = r.deleted_at ?? null;
          r.sync_started_at = r.sync_started_at ?? null;
          if (r.status === "syncing") r.status = "pending_sync";
        });
      });
    this.version(3)
      .stores({
        diagnoses:
          "local_id, status, server_id, updated_at, deleted_at, sync_started_at",
        session: "id",
        comunidades_cache: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("session").clear();
      });
    /** v4: índice em `nome` para `orderBy("nome")` no cache de comunidades (Dexie exige índice explícito). */
    this.version(4).stores({
      diagnoses:
        "local_id, status, server_id, updated_at, deleted_at, sync_started_at",
      session: "id",
      comunidades_cache: "id, nome",
    });
    /** v5: controle de edições pós-conclusão (LGPD / integridade de campo). */
    this.version(5)
      .stores({
        diagnoses:
          "local_id, status, server_id, updated_at, deleted_at, sync_started_at",
        session: "id",
        comunidades_cache: "id, nome",
      })
      .upgrade(async (tx) => {
        await tx
          .table("diagnoses")
          .toCollection()
          .modify((r: Record<string, unknown>) => {
            if (r.has_been_completed === undefined) {
              r.has_been_completed = r.status !== "draft";
            }
            if (r.post_completion_edits === undefined) {
              r.post_completion_edits = 0;
            }
          });
      });
    /** v6: metadados do catálogo de comunidades (`catalog_fetched_at`). */
    this.version(6).stores({
      diagnoses:
        "local_id, status, server_id, updated_at, deleted_at, sync_started_at",
      session: "id",
      comunidades_cache: "id, nome",
      catalog_meta: "id",
    });
  }
}

export const db = new DiagnosticoDB();
