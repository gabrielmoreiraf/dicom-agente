import { db } from "@/db";
import type { ComunidadeItem } from "@/domain/comunidades";
import { getSession } from "@/features/auth/session";
import { apiUrl, useAgentApiMock } from "@/services/apiBase";

const STUB: ComunidadeItem[] = Array.from({ length: 24 }, (_, i) => ({
  id: `pref-${String(i + 1).padStart(3, "0")}`,
  nome: `Comunidade exemplo ${i + 1}`,
  distrito: null,
}));

export const COMUNIDADES_CATALOG_META_ID = "comunidades_catalog" as const;

/** Evita requisições paralelas duplicadas (login + hidratação + UI). */
let refreshCatalogInFlight: Promise<RefreshComunidadesCatalogResult> | null = null;

/** IDs gerados apenas no fallback local de demonstração — não confundir com dados da API. */
function isStubCatalog(rows: ComunidadeItem[]): boolean {
  return rows.length > 0 && rows.every((r) => r.id.startsWith("pref-"));
}

/**
 * Remove cache Dexie de demonstração para não mascarar o catálogo real após configurar a API.
 */
async function clearStubCacheIfNeeded(): Promise<void> {
  if (useAgentApiMock()) return;
  const rows = await db.comunidades_cache.toArray();
  if (isStubCatalog(rows)) {
    await db.comunidades_cache.clear();
    await db.catalog_meta.delete(COMUNIDADES_CATALOG_META_ID);
  }
}

/**
 * Catálogo oficial: GET /comunidades/catalog (JWT) — apenas comunidades ativas.
 * Lista mínima (id, nome, distrito); requer sessão autenticada quando não está em mock.
 */
async function fetchFromNetwork(): Promise<ComunidadeItem[]> {
  if (useAgentApiMock()) {
    await new Promise((r) => setTimeout(r, 80));
    return STUB;
  }
  if (!navigator.onLine) {
    throw new Error("offline");
  }

  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Sessão não encontrada. Faça login novamente para carregar as comunidades.");
  }

  const res = await fetch(apiUrl("/comunidades/catalog"), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      res.status === 401
        ? "Não autorizado ao carregar comunidades. Faça login novamente."
        : text?.slice(0, 200) || `HTTP ${res.status}`,
    );
  }

  const data = (await res.json()) as ComunidadeItem[];
  return Array.isArray(data) ? data : [];
}

async function persistComunidadesCatalog(fresh: ComunidadeItem[]): Promise<string> {
  const fetchedAt = new Date().toISOString();
  await db.transaction("rw", db.comunidades_cache, db.catalog_meta, async () => {
    await db.comunidades_cache.clear();
    if (fresh.length > 0) {
      await db.comunidades_cache.bulkPut(fresh);
    }
    await db.catalog_meta.put({
      id: COMUNIDADES_CATALOG_META_ID,
      catalog_fetched_at: fetchedAt,
    });
  });
  return fetchedAt;
}

export type RefreshComunidadesCatalogResult =
  | { ok: true; count: number; fetchedAt: string }
  | { ok: false; reason: "offline" | "no_session"; message?: string }
  | { ok: false; reason: "error"; message: string };

/**
 * Busca o catálogo na rede, grava em `comunidades_cache` e atualiza `catalog_fetched_at`.
 * Chamadas concorrentes compartilham a mesma Promise (single-flight).
 * Não lança em `offline` / sem sessão (retorna `ok: false`) — adequado para prefetch pós-login.
 */
export async function refreshComunidadesCatalog(): Promise<RefreshComunidadesCatalogResult> {
  if (refreshCatalogInFlight) return refreshCatalogInFlight;

  const run = (async (): Promise<RefreshComunidadesCatalogResult> => {
    await clearStubCacheIfNeeded();

    if (useAgentApiMock()) {
      const fresh = await fetchFromNetwork();
      const fetchedAt = await persistComunidadesCatalog(fresh);
      return { ok: true, count: fresh.length, fetchedAt };
    }

    if (!navigator.onLine) {
      return { ok: false, reason: "offline", message: "Sem conexão" };
    }

    const session = await getSession();
    if (!session?.accessToken) {
      return { ok: false, reason: "no_session", message: "Sessão não encontrada" };
    }

    try {
      const fresh = await fetchFromNetwork();
      const fetchedAt = await persistComunidadesCatalog(fresh);
      return { ok: true, count: fresh.length, fetchedAt };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { ok: false, reason: "error", message };
    }
  })();

  refreshCatalogInFlight = run;

  try {
    return await run;
  } finally {
    refreshCatalogInFlight = null;
  }
}

/** ISO da última gravação bem-sucedida do catálogo, ou `null`. */
export async function getComunidadesCatalogFetchedAt(): Promise<string | null> {
  const row = await db.catalog_meta.get(COMUNIDADES_CATALOG_META_ID);
  return row?.catalog_fetched_at ?? null;
}

/** Texto curto para UI (lista + botão atualizar). */
export function formatComunidadesCatalogLabel(fetchedAtIso: string | null | undefined): string {
  if (!fetchedAtIso?.trim()) {
    return "Catálogo ainda não sincronizado";
  }
  const d = new Date(fetchedAtIso);
  if (Number.isNaN(d.getTime())) {
    return "Catálogo ainda não sincronizado";
  }
  return `Lista atualizada em ${d.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })}`;
}

/**
 * Lista de comunidades para o passo 1 — **offline-first**:
 * com API real, não usa mais fallback silencioso de “comunidades exemplo” (evita confundir com cadastro da prefeitura).
 */
export async function fetchComunidades(): Promise<ComunidadeItem[]> {
  await clearStubCacheIfNeeded();

  const cached = await db.comunidades_cache.orderBy("nome").toArray();

  if (!navigator.onLine) {
    if (cached.length > 0) return cached;
    if (useAgentApiMock()) {
      const fresh = STUB;
      await persistComunidadesCatalog(fresh);
      return fresh;
    }
    throw new Error("Sem conexão e sem cache de comunidades. Conecte-se e abra o diagnóstico novamente.");
  }

  if (useAgentApiMock()) {
    const fresh = await fetchFromNetwork();
    await persistComunidadesCatalog(fresh);
    return fresh;
  }

  try {
    const fresh = await fetchFromNetwork();
    await persistComunidadesCatalog(fresh);
    return fresh;
  } catch (e) {
    if (cached.length > 0 && !isStubCatalog(cached)) {
      return cached;
    }
    throw e instanceof Error ? e : new Error(String(e));
  }
}
