import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import { formatIsoDateBR } from "@/lib/formatIsoDateBR";

/** Sugestão de título ao salvar rascunho (comunidade + data em BR). */
export function formatDefaultDraftTitle(values: DiagnosisFormValues): string {
  const d = values.data_coleta ? formatIsoDateBR(values.data_coleta) : "";
  const c = values.comunidade?.trim();
  if (c && d) return `${c} — ${d}`;
  if (c) return c;
  if (d) return `Rascunho — ${d}`;
  return "Rascunho";
}
