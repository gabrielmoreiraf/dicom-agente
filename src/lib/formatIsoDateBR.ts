import { format, isValid, parseISO } from "date-fns";

/** Ex.: `2026-04-03` → `03/04/2026`. Se não for ISO válido, devolve o texto original. */
export function formatIsoDateBR(value: string): string {
  const s = value.trim();
  if (!s) return "";
  const d = parseISO(s);
  if (!isValid(d)) return value;
  return format(d, "dd/MM/yyyy");
}
