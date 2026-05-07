import { z } from "zod";
import {
  diagnosisFormSchema,
  STEP_LABELS,
  stepAssinaturaSchema,
  stepSchemas,
} from "@/schemas/diagnosis";
import type { FormTemplateField } from "@/domain/formTemplate";
import { buildExtraFieldsSchema } from "@/features/forms/buildExtraFieldSchema";

export type WizardLayout = {
  stepCount: number;
  labels: readonly string[];
  extraStep: number | null;
  assinaturaStep: number;
};

export function getWizardLayout(extraFieldCount: number): WizardLayout {
  if (extraFieldCount <= 0) {
    return {
      stepCount: STEP_LABELS.length,
      labels: STEP_LABELS,
      extraStep: null,
      assinaturaStep: STEP_LABELS.length,
    };
  }
  return {
    stepCount: STEP_LABELS.length + 1,
    labels: [
      ...STEP_LABELS.slice(0, STEP_LABELS.length - 1),
      "Perguntas adicionais",
      "Assinatura",
    ],
    extraStep: STEP_LABELS.length,
    assinaturaStep: STEP_LABELS.length + 1,
  };
}

export function getSchemaForWizardStep(
  uiStep: number,
  layout: WizardLayout,
  extraFields: FormTemplateField[],
): z.ZodTypeAny | null {
  if (layout.extraStep !== null && uiStep === layout.extraStep) {
    return extraFields.length > 0 ? buildExtraFieldsSchema(extraFields) : z.object({});
  }
  if (uiStep === layout.assinaturaStep) {
    return stepAssinaturaSchema;
  }
  const baseIndex = uiStep - 1;
  if (baseIndex >= 0 && baseIndex < stepSchemas.length - 1) {
    return stepSchemas[baseIndex]!;
  }
  return null;
}

/** Mapeia etapa da UI para o componente do wizard (1–9 fixos + 10 extras). */
export function getWizardRouterStep(
  uiStep: number,
  layout: WizardLayout,
): number | "extras" {
  if (layout.extraStep !== null && uiStep === layout.extraStep) {
    return "extras";
  }
  if (uiStep === layout.assinaturaStep) {
    return 9;
  }
  return uiStep;
}

/** Validação final: núcleo + extras + assinatura. */
export function buildCompleteDiagnosisSchema(extraFields: FormTemplateField[]) {
  let schema: z.ZodTypeAny = diagnosisFormSchema;
  if (extraFields.length > 0) {
    schema = diagnosisFormSchema.merge(buildExtraFieldsSchema(extraFields));
  }
  return schema.superRefine((data, ctx) => {
    const d = data as { resp_nome?: string; signature_data_url?: string };
    if (!d.resp_nome?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o responsável",
        path: ["resp_nome"],
      });
    }
    if (!d.signature_data_url?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "É necessário assinar no quadro de assinatura digital acima para concluir.",
        path: ["signature_data_url"],
      });
    }
  });
}
