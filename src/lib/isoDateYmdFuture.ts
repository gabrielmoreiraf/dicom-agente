/**
 * ISO `yyyy-mm-dd` no calendário local. `true` se a data for estritamente depois de hoje.
 */
export function isIsoDateYmdFuture(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const parsed = new Date(y, mo - 1, d);
  if (parsed.getFullYear() !== y || parsed.getMonth() !== mo - 1 || parsed.getDate() !== d) {
    return false;
  }
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return parsed.getTime() > todayStart.getTime();
}
