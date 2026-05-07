import type { FormTemplateCampo, FormTemplateField } from "@/domain/formTemplate";
import { isDiagnosisCoreFieldKey } from "@/features/forms/diagnosisCoreKeys";
import { isFormsModuleEnabled } from "@/lib/featureFlags";
import { getSession } from "@/features/auth/session";
import { db } from "@/db";
import { apiUrl, useAgentApiMock } from "@/services/apiBase";

const CACHE_ID = "diagnosis_form_template" as const;

let refreshInFlight: Promise<FormTemplateCampo | null> | null = null;

function mockDiagnosisTemplate(): FormTemplateCampo {
  return {
    id: "mock-diagnosis",
    name: "Diagnóstico comunitário",
    description: null,
    isSystem: true,
    fields: [],
    updatedAt: new Date().toISOString(),
  };
}

async function fetchFromNetwork(): Promise<FormTemplateCampo> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Faça login para carregar o formulário.");
  }

  const res = await fetch(apiUrl("/formularios/campo/diagnostico"), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<FormTemplateCampo>;
}

async function persistTemplate(template: FormTemplateCampo): Promise<string> {
  const fetchedAt = new Date().toISOString();
  await db.form_template_meta.put({
    id: CACHE_ID,
    fetched_at: fetchedAt,
    template_json: JSON.stringify(template),
  });
  return fetchedAt;
}

async function readCachedTemplate(): Promise<FormTemplateCampo | null> {
  const row = await db.form_template_meta.get(CACHE_ID);
  if (!row?.template_json) return null;
  try {
    return JSON.parse(row.template_json) as FormTemplateCampo;
  } catch {
    return null;
  }
}

export async function getCachedFormTemplateFetchedAt(): Promise<string | null> {
  const row = await db.form_template_meta.get(CACHE_ID);
  return row?.fetched_at ?? null;
}

/** Atualiza o modelo do formulário na rede (não lança offline). */
export async function refreshDiagnosisFormTemplate(): Promise<
  { ok: true; template: FormTemplateCampo; fetchedAt: string } | { ok: false }
> {
  if (!isFormsModuleEnabled()) {
    return { ok: false };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { ok: false };
  }

  if (refreshInFlight) {
    const t = await refreshInFlight;
    if (!t) return { ok: false };
    const fetchedAt = (await getCachedFormTemplateFetchedAt()) ?? new Date().toISOString();
    return { ok: true, template: t, fetchedAt };
  }

  const run = async (): Promise<FormTemplateCampo | null> => {
    try {
      if (useAgentApiMock()) {
        const mock = mockDiagnosisTemplate();
        await persistTemplate(mock);
        return mock;
      }
      const fresh = await fetchFromNetwork();
      await persistTemplate(fresh);
      return fresh;
    } catch {
      return null;
    }
  };

  refreshInFlight = run();
  const template = await refreshInFlight;
  refreshInFlight = null;
  if (!template) return { ok: false };
  const fetchedAt = (await getCachedFormTemplateFetchedAt()) ?? new Date().toISOString();
  return { ok: true, template, fetchedAt };
}

/** Template para o wizard — rede com fallback no cache local. */
export async function loadDiagnosisFormTemplate(): Promise<FormTemplateCampo> {
  if (!isFormsModuleEnabled()) {
    return mockDiagnosisTemplate();
  }

  if (useAgentApiMock()) {
    const cached = await readCachedTemplate();
    return cached ?? mockDiagnosisTemplate();
  }

  if (typeof navigator !== "undefined" && navigator.onLine) {
    try {
      const fresh = await fetchFromNetwork();
      await persistTemplate(fresh);
      return fresh;
    } catch {
      /* fallback cache */
    }
  }

  const cached = await readCachedTemplate();
  if (cached) return cached;

  throw new Error(
    "Formulário não disponível offline. Conecte-se à internet e abra o app novamente.",
  );
}

export function splitExtraTemplateFields(
  fields: FormTemplateField[],
): FormTemplateField[] {
  return fields
    .filter((f) => !isDiagnosisCoreFieldKey(f.fieldKey))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function defaultValueForTemplateField(
  field: FormTemplateField,
): string | number | string[] {
  switch (field.type) {
    case "number":
      return 0;
    case "checkbox":
      return [];
    case "yes_no":
      return "nao";
    default:
      return "";
  }
}

export function applyExtraDefaultsToForm(
  extras: FormTemplateField[],
  current: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...current };
  for (const f of extras) {
    if (out[f.fieldKey] === undefined) {
      out[f.fieldKey] = defaultValueForTemplateField(f);
    }
  }
  return out;
}
