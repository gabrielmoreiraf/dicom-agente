import { z } from "zod";

/**
 * Schemas por etapa + merge (`diagnosisFormSchema`). Tipos de domínio em `@/domain/diagnosis`.
 * O wizard valida cada passo com `stepSchemas[i]`; conclusão usa `completeDiagnosisSchema`.
 */

/** Números inteiros ≥ 0 (inputs de formulário coerced) */
const n = z.coerce.number().int().min(0, "Deve ser ≥ 0");

const simNao = z.enum(["sim", "nao"]);

export const stepIdentificationSchema = z.object({
  comunidade: z.string().min(1, "Informe a comunidade"),
  distrito: z.string().optional(),
  data_coleta: z.string().min(1, "Informe a data da coleta"),
  observacoes: z.string().optional(),
  pesquisador: z.string().min(1, "Informe o pesquisador responsável"),
  gps: z.string().optional(),
});

export const stepFamiliesSchema = z.object({
  familias_socias: n,
  familias_nao_socias: n,
});

const stepCasasShape = z.object({
  casas_total: n,
  casas_alvenaria: n,
  casas_taipa: n,
  sem_caixa: n,
  sem_banheiro: n,
  sem_energia: n,
  sem_fossa: n,
  sem_agua: n,
});

/** Etapa 3 — só inteiros ≥ 0 (sem travar alvenaria+taipa vs total: coleta de campo admite valores altos / não exclusivos). */
export const stepCasasSchema = stepCasasShape;

export const stepHidricoSchema = z.object({
  cist_placa: n,
  cist_enxurrada: n,
  cist_alvenaria: n,
  cist_comunitarias: n,
  poco_func: n,
  poco_obstruido: n,
  poco_dessal: n,
  poco_seco: n,
  abast_possui: simNao,
  abast_func: simNao,
  cacimba: n,
  barragens_sub: n,
  cacimbao_alv: n,
  acude_com: n,
  acude_part: n,
});

export const stepPecuariaSchema = z.object({
  pec_asininos: n,
  pec_bovinos: n,
  pec_caprinos: n,
  pec_equinos: n,
  pec_galinhas: n,
  pec_ovinos: n,
  pec_suinos: n,
});

export const stepAgriculturaSchema = z.object({
  agr_milho: n,
  agr_feijao: n,
  agr_algodao: n,
  agr_mamona: n,
  agr_mandioca: n,
  agr_acerola: n,
  agr_banana: n,
  agr_caju: n,
  agr_mamao: n,
  agr_hortalicas: n,
});

const membroFiscalSchema = z.object({
  nome: z.string().optional(),
  telefone: z.string().optional(),
  nasc: z.string().optional(),
});

export const stepAssociacaoSchema = z.object({
  assoc_nome: z.string().optional(),
  assoc_fundacao: z.string().optional(),
  assoc_diretoria: z.string().optional(),
  dir_p_nome: z.string().optional(),
  dir_p_tel: z.string().optional(),
  dir_p_nasc: z.string().optional(),
  dir_vp_nome: z.string().optional(),
  dir_vp_tel: z.string().optional(),
  dir_vp_nasc: z.string().optional(),
  dir_t_nome: z.string().optional(),
  dir_t_tel: z.string().optional(),
  dir_t_nasc: z.string().optional(),
  dir_t2_nome: z.string().optional(),
  dir_t2_tel: z.string().optional(),
  dir_t2_nasc: z.string().optional(),
  dir_s_nome: z.string().optional(),
  dir_s_tel: z.string().optional(),
  dir_s_nasc: z.string().optional(),
  dir_s2_nome: z.string().optional(),
  dir_s2_tel: z.string().optional(),
  dir_s2_nasc: z.string().optional(),
  fiscal: z.array(membroFiscalSchema).default([]),
});

export const stepAssinaturaSchema = z.object({
  resp_nome: z.string().min(1, "Informe o responsável"),
  signature_data_url: z.string().optional(),
});

/** Formulário completo (todas as etapas) */
export const diagnosisFormSchema = stepIdentificationSchema
  .merge(stepFamiliesSchema)
  .merge(stepCasasShape)
  .merge(stepHidricoSchema)
  .merge(stepPecuariaSchema)
  .merge(stepAgriculturaSchema)
  .merge(stepAssociacaoSchema)
  .merge(stepAssinaturaSchema);

export type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema>;

export const stepSchemas = [
  stepIdentificationSchema,
  stepFamiliesSchema,
  stepCasasSchema,
  stepHidricoSchema,
  stepPecuariaSchema,
  stepAgriculturaSchema,
  stepAssociacaoSchema,
  stepAssinaturaSchema,
] as const;

export const STEP_LABELS = [
  "Identificação",
  "Famílias",
  "Casas",
  "Potencial hídrico",
  "Pecuária",
  "Agricultura",
  "Associação",
  "Assinatura",
] as const;

/** Validação para conclusão (assinatura obrigatória + canvas) */
export const completeDiagnosisSchema = diagnosisFormSchema.superRefine((data, ctx) => {
  if (!data.resp_nome?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe o responsável",
      path: ["resp_nome"],
    });
  }
  if (!data.signature_data_url?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Assinatura obrigatória para concluir",
      path: ["signature_data_url"],
    });
  }
});

export function getDefaultDiagnosisValues(): DiagnosisFormValues {
  return {
    comunidade: "",
    distrito: "",
    data_coleta: "",
    observacoes: "",
    pesquisador: "",
    gps: "",
    familias_socias: 0,
    familias_nao_socias: 0,
    casas_total: 0,
    casas_alvenaria: 0,
    casas_taipa: 0,
    sem_caixa: 0,
    sem_banheiro: 0,
    sem_energia: 0,
    sem_fossa: 0,
    sem_agua: 0,
    cist_placa: 0,
    cist_enxurrada: 0,
    cist_alvenaria: 0,
    cist_comunitarias: 0,
    poco_func: 0,
    poco_obstruido: 0,
    poco_dessal: 0,
    poco_seco: 0,
    abast_possui: "nao",
    abast_func: "nao",
    cacimba: 0,
    barragens_sub: 0,
    cacimbao_alv: 0,
    acude_com: 0,
    acude_part: 0,
    pec_asininos: 0,
    pec_bovinos: 0,
    pec_caprinos: 0,
    pec_equinos: 0,
    pec_galinhas: 0,
    pec_ovinos: 0,
    pec_suinos: 0,
    agr_milho: 0,
    agr_feijao: 0,
    agr_algodao: 0,
    agr_mamona: 0,
    agr_mandioca: 0,
    agr_acerola: 0,
    agr_banana: 0,
    agr_caju: 0,
    agr_mamao: 0,
    agr_hortalicas: 0,
    assoc_nome: "",
    assoc_fundacao: "",
    assoc_diretoria: "",
    dir_p_nome: "",
    dir_p_tel: "",
    dir_p_nasc: "",
    dir_vp_nome: "",
    dir_vp_tel: "",
    dir_vp_nasc: "",
    dir_t_nome: "",
    dir_t_tel: "",
    dir_t_nasc: "",
    dir_t2_nome: "",
    dir_t2_tel: "",
    dir_t2_nasc: "",
    dir_s_nome: "",
    dir_s_tel: "",
    dir_s_nasc: "",
    dir_s2_nome: "",
    dir_s2_tel: "",
    dir_s2_nasc: "",
    fiscal: [],
    resp_nome: "",
    signature_data_url: "",
  };
}
