import { getSession } from "@/features/auth/session";
import { apiUrl, useAgentApiMock } from "@/services/apiBase";

export type AssociationByComunidade = {
  id: string;
  nome: string;
  presidenteNome: string | null;
  comunidadeNome: string;
};

export async function fetchAssociationByComunidade(
  comunidadeNome: string,
): Promise<AssociationByComunidade | null> {
  const trimmed = comunidadeNome?.trim();
  if (!trimmed) return null;
  if (useAgentApiMock()) return null;

  const session = getSession();
  if (!session?.accessToken) return null;

  const url = apiUrl(
    `/associacoes/por-comunidade?nome=${encodeURIComponent(trimmed)}`,
  );
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as AssociationByComunidade | null;
  return data?.nome ? data : null;
}
