import { db } from "@/db";
import type { ComunidadeItem } from "@/domain/comunidades";
import { getSession } from "@/features/auth/session";
import { apiUrl, useAgentApiMock } from "@/services/apiBase";

const STUB: ComunidadeItem[] = Array.from({ length: 24 }, (_, i) => ({
  id: `pref-${String(i + 1).padStart(3, "0")}`,
  nome: `Comunidade exemplo ${i + 1}`,
  distrito: null,
}));

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
      await db.comunidades_cache.bulkPut(STUB);
      return STUB;
    }
    throw new Error("Sem conexão e sem cache de comunidades. Conecte-se e abra o diagnóstico novamente.");
  }

  if (useAgentApiMock()) {
    await db.comunidades_cache.clear();
    await db.comunidades_cache.bulkPut(STUB);
    return STUB;
  }

  try {
    const fresh = await fetchFromNetwork();
    await db.transaction("rw", db.comunidades_cache, async () => {
      await db.comunidades_cache.clear();
      if (fresh.length > 0) {
        await db.comunidades_cache.bulkPut(fresh);
      }
    });
    return fresh;
  } catch (e) {
    if (cached.length > 0 && !isStubCatalog(cached)) {
      return cached;
    }
    throw e instanceof Error ? e : new Error(String(e));
  }
}
