/** Remove tudo que não for dígito (máx. 11). */
export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

/** Máscara visual: 000.000.000-00 */
export function maskCpf(value: string): string {
  const d = normalizeCpf(value);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

export function isValidCpfLength(cpf: string): boolean {
  return normalizeCpf(cpf).length === 11;
}
