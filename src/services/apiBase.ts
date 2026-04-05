/** Base da API ou vazio para mesma origem (proxy do Vite em dev). */
export function getApiBase(): string {
  return import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
}

/** Caminho absoluto na API ou relativo ao host do front (proxy). */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const b = getApiBase();
  return b ? `${b}${p}` : p;
}

/**
 * Mock sem backend: padrão quando não há VITE_API_URL.
 * `VITE_USE_API_MOCK=false` + URL vazia = API real via proxy do Vite.
 */
export function useAgentApiMock(): boolean {
  if (import.meta.env.VITE_USE_API_MOCK === "true") return true;
  if (import.meta.env.VITE_USE_API_MOCK === "false") return false;
  return !getApiBase().trim();
}
