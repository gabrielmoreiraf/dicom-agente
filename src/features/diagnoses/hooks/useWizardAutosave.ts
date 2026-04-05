import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { QueryClient } from "@tanstack/react-query";
import type { DiagnosisRecord } from "@/domain/diagnosis";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import { canEditDiagnosis, savePayload } from "@/features/diagnoses/services/diagnosisService";

const DEFAULT_DEBOUNCE_MS = 550;

/**
 * Estados em que gravar como rascunho poderia competir com a fila de sync ou reenvio.
 * Evita degradar `pending_sync` → `draft` ou escrever durante `syncing`.
 */
function isAutosaveSafeStatus(status: DiagnosisRecord["status"]): boolean {
  return status !== "pending_sync" && status !== "syncing";
}

function shouldAutosave(record: DiagnosisRecord): boolean {
  return canEditDiagnosis(record) && isAutosaveSafeStatus(record.status);
}

type FlushableContext = {
  localId: string | undefined;
  readOnly: boolean;
  record: DiagnosisRecord | undefined;
  getValues: () => DiagnosisFormValues;
  queryClient: QueryClient | undefined;
};

export interface UseWizardAutosaveOptions {
  form: UseFormReturn<DiagnosisFormValues>;
  localId: string | undefined;
  record: DiagnosisRecord | undefined;
  readOnly: boolean;
  /** Entre 300 e 800 ms recomendado */
  debounceMs?: number;
  queryClient?: QueryClient;
  /** `beforeunload` dispara flush (sem `preventDefault` — apenas tentativa de gravação). */
  flushOnBeforeUnload?: boolean;
}

export interface UseWizardAutosaveResult {
  autosaveError: string | null;
  /**
   * Persistência imediata se o snapshot atual difere do último salvo (mesmo critério do debounce/flush).
   * Cancela timer de debounce pendente. Rejeita se `savePayload` falhar (ex.: uso em `goNext`).
   */
  persistAfterStepNav: () => Promise<void>;
  /**
   * Alinha `lastSavedJsonRef` ao `getValues()` atual — chame após `savePayload` fora do hook
   * (salvar rascunho com título, etc.) para evitar regravação redundante e drift do baseline.
   */
  syncBaselineFromForm: () => void;
}

type PersistApi = {
  clearDebounceTimer: () => void;
  enqueuePersistIfDirty: () => void;
  flushNow: () => void;
  persistAfterStepNav: () => Promise<void>;
};

/**
 * Persistência automática do wizard em Dexie (`draft`) com debounce + flush imediato
 * em `visibilitychange` (hidden), `pagehide`, desmontagem e opcionalmente `beforeunload`.
 *
 * **Fechamento do app:** IndexedDB é assíncrono; `flushNow` aumenta a chance de persistir,
 * mas não há garantia no `beforeunload`. Em PWA/campo: confiar em `visibilitychange`/`pagehide`,
 * `persistAfterStepNav`, e opcionalmente `navigator.storage.persist()` onde suportado.
 */
export function useWizardAutosave(options: UseWizardAutosaveOptions): UseWizardAutosaveResult {
  const {
    form,
    localId,
    record,
    readOnly,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    queryClient,
    flushOnBeforeUnload = true,
  } = options;
  const { watch, getValues } = form;

  const [autosaveError, setAutosaveError] = useState<string | null>(null);

  const lastSavedJsonRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTailRef = useRef<Promise<unknown>>(Promise.resolve());
  const mountedRef = useRef(true);
  const flushableRef = useRef<FlushableContext>({
    localId: undefined,
    readOnly: true,
    record: undefined,
    getValues,
    queryClient,
  });

  const persistRef = useRef<PersistApi>({
    clearDebounceTimer: () => {},
    enqueuePersistIfDirty: () => {},
    flushNow: () => {},
    persistAfterStepNav: async () => {},
  });

  flushableRef.current = {
    localId,
    readOnly,
    record,
    getValues,
    queryClient,
  };

  const enabled = Boolean(
    localId && !readOnly && record && shouldAutosave(record),
  );

  /** Grava se houver diferença em relação a `lastSavedJsonRef`; atualiza baseline e invalida queries. */
  const executePersistIfDirty = async (): Promise<void> => {
    const c = flushableRef.current;
    if (!c.localId || c.readOnly || !c.record || !shouldAutosave(c.record)) return;

    const latestJson = JSON.stringify(c.getValues());
    if (latestJson === lastSavedJsonRef.current) return;

    await savePayload(c.localId, c.getValues(), "draft");
    lastSavedJsonRef.current = JSON.stringify(c.getValues());
    if (mountedRef.current) {
      setAutosaveError(null);
      if (c.queryClient) {
        void c.queryClient.invalidateQueries({ queryKey: ["diagnoses"] });
        void c.queryClient.invalidateQueries({ queryKey: ["diagnosis", c.localId] });
      }
    } else if (c.queryClient) {
      void c.queryClient.invalidateQueries({ queryKey: ["diagnoses"] });
      void c.queryClient.invalidateQueries({ queryKey: ["diagnosis", c.localId] });
    }
  };

  persistRef.current.clearDebounceTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  persistRef.current.enqueuePersistIfDirty = () => {
    saveTailRef.current = saveTailRef.current
      .then(() => executePersistIfDirty())
      .catch((e) => {
        if (mountedRef.current) {
          const msg = e instanceof Error ? e.message : String(e);
          setAutosaveError(msg);
        }
      });
  };

  persistRef.current.flushNow = () => {
    persistRef.current.clearDebounceTimer();
    const c = flushableRef.current;
    if (!c.localId || c.readOnly || !c.record || !shouldAutosave(c.record)) return;
    const json = JSON.stringify(c.getValues());
    if (json === lastSavedJsonRef.current) return;
    persistRef.current.enqueuePersistIfDirty();
  };

  persistRef.current.persistAfterStepNav = async () => {
    persistRef.current.clearDebounceTimer();
    const c = flushableRef.current;
    if (!c.localId || c.readOnly || !c.record || !shouldAutosave(c.record)) return;
    if (JSON.stringify(c.getValues()) === lastSavedJsonRef.current) return;

    const op = saveTailRef.current.then(() => executePersistIfDirty());
    saveTailRef.current = op.catch(() => {});
    await op;
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !localId || !record) {
      persistRef.current.clearDebounceTimer();
      return;
    }

    lastSavedJsonRef.current = JSON.stringify(getValues());

    const sub = watch(() => {
      persistRef.current.clearDebounceTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const snapshotJson = JSON.stringify(getValues());
        if (snapshotJson === lastSavedJsonRef.current) return;
        persistRef.current.enqueuePersistIfDirty();
      }, debounceMs);
    });

    return () => {
      sub.unsubscribe();
      persistRef.current.clearDebounceTimer();
    };
  }, [enabled, localId, record, watch, getValues, debounceMs]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;

    let listenersActive = false;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") persistRef.current.flushNow();
    };

    const onPageHide = () => {
      persistRef.current.flushNow();
    };

    const onBeforeUnload = () => {
      persistRef.current.flushNow();
    };

    if (enabled) {
      document.addEventListener("visibilitychange", onVisibilityChange);
      window.addEventListener("pagehide", onPageHide);
      if (flushOnBeforeUnload) {
        window.addEventListener("beforeunload", onBeforeUnload);
      }
      listenersActive = true;
    }

    return () => {
      if (listenersActive) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("pagehide", onPageHide);
        if (flushOnBeforeUnload) {
          window.removeEventListener("beforeunload", onBeforeUnload);
        }
      }
      persistRef.current.flushNow();
    };
  }, [enabled, flushOnBeforeUnload]);

  const persistAfterStepNav = useCallback(async () => {
    await persistRef.current.persistAfterStepNav();
  }, []);

  const syncBaselineFromForm = useCallback(() => {
    lastSavedJsonRef.current = JSON.stringify(flushableRef.current.getValues());
    if (mountedRef.current) setAutosaveError(null);
  }, []);

  return { autosaveError, persistAfterStepNav, syncBaselineFromForm };
}
