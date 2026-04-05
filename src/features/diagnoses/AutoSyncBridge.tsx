import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { syncPendingDiagnoses } from "@/features/diagnoses/services/syncService";

/**
 * Enquanto o agente estiver online, tenta enviar diagnósticos em `pending_sync`
 * (debounce ao reconectar; mutex no serviço evita POSTs duplicados).
 */
export function AutoSyncBridge() {
  const online = useOnlineStatus();
  const qc = useQueryClient();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!online) return;

    const id = window.setTimeout(() => {
      void (async () => {
        try {
          await syncPendingDiagnoses();
          if (mounted.current) {
            await qc.invalidateQueries();
          }
        } catch {
          /* falha de rede / API — próxima janela online ou tela Sync */
        }
      })();
    }, 400);

    return () => window.clearTimeout(id);
  }, [online, qc]);

  return null;
}
