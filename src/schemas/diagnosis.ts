import { z } from "zod";
import { isIsoDateYmdFuture } from "@/lib/isoDateYmdFuture";

/**
 * Schemas por etapa + merge (`diagnosisFormSchema`). Tipos de domínio em `@/domain/diagnosis`.
 * O wizard valida cada passo com `stepSchemas[i]`; conclusão usa `completeDiagnosisSchema`.
 */

/** Números inteiros ≥ 0 (inputs de formulário coerced) */
const n = z.coerce.number().int().min(0, "Deve ser ≥ 0");

const simNao = z.enum(["sim", "nao"]);

const msgDataFutura = "A data não pode ser futura";

const zDataYmdOpcionalNaoFutura = z.string().refine((s) => !s.trim() || !isIsoDateYmdFuture(s), {
  message: msgDataFutura,
});

export const stepIdentificationSchema = z.object({
  comunidade: z.string().min(1, "Informe a comunidade"),
  distrito: z.string().optional(),
  data_coleta: z
    .string()
    .min(1, "Informe a data da coleta")
    .refine((s) => !isIsoDateYmdFuture(s), { message: msgDataFutura }),
  observacoes: z.string().optional(),
  pesquisador: z.string().min(1, "Informe o pesquisador responsável"),
  gps: z.string().optional(),
  vizinha_leste: z.string().optional(),
  vizinha_oeste: z.string().optional(),
  vizinha_norte: z.string().optional(),
  vizinha_sul: z.string().optional(),
});

export const stepFamiliesSchema = z.object({
  familias_socias: n,
  familias_nao_socias: n,
});

const stepCasasShape = z.object({
  casas_total: n,
  casas_alvenaria: n,
  casas_alvenaria_sem_morador: n,
  casas_taipa: n,
  casas_taipa_sem_morador: n,
  sem_caixa: n,
  sem_banheiro: n,
  sem_energia: n,
  sem_fossa: n,
  sem_agua: n,
  energia_trifasica: simNao,
  trator_publico: n,
  trator_particular: n,
});

/** Etapa 3 — só inteiros ≥ 0 (sem travar alvenaria+taipa vs total: coleta de campo admite valores altos / não exclusivos). */
export const stepCasasSchema = stepCasasShape;

export const stepHidricoSchema = z.object({
  cist_placa: n,
  cist_enxurrada: n,
  cist_alvenaria: n,
  cist_comunitarias: n,
  cist_sem_placa: n,
  poco_publico: n,
  poco_particular: n,
  poco_func: n,
  poco_obstruido: n,
  poco_dessal: n,
  poco_seco: n,
  abast_possui: simNao,
  abast_func: simNao,
  abast_motivo: z.string().optional(),
  cacimba_publico: n,
  cacimba_particular: n,
  /** Legado — soma ou valor único em registros antigos */
  cacimba: n,
  barragens_sub_publico: n,
  barragens_sub_particular: n,
  barragens_sub: n,
  cacimbao_publico: n,
  cacimbao_particular: n,
  cacimbao_alv: n,
  acude_com: n,
  acude_part: n,
});

export const stepEmpregabilidadeSchema = z.object({
  emp_familias_artesao: z.string().optional(),
  emp_pessoas_na_comunidade: n,
  emp_pessoas_fora_comunidade: n,
});

export const stepPecuariaSchema = z.object({
  pec_apicultura: n,
  pec_asininos: n,
  pec_bovinos: n,
  pec_caprinos: n,
  pec_equinos: n,
  pec_muares: n,
  pec_galinhas: n,
  pec_ovinos: n,
  pec_suinos: n,
  prod_leite_l_dia: n,
  prod_mel_l_ano: n,
  prod_ovos_un_dia: n,
});

export const stepAgriculturaSchema = z.object({
  agr_milho: n,
  agr_feijao: n,
  agr_fava: n,
  agr_algodao: n,
  agr_mamona: n,
  agr_mandioca: n,
  agr_acerola: n,
  agr_banana: n,
  agr_caju: n,
  agr_mamao: n,
  agr_goiaba: n,
  agr_hortalicas: n,
  agr_batata_doce: n,
  agr_palma: n,
  agr_capim_elefante: n,
});

const membroFiscalSchema = z.object({
  nome: z.string().optional(),
  telefone: z.string().optional(),
  nasc: zDataYmdOpcionalNaoFutura,
});

export const stepAssociacaoSchema = z.object({
  assoc_nome: z.string().optional(),
  assoc_cnpj: z.string().optional(),
  assoc_sede_propria: simNao,
  assoc_fundacao: zDataYmdOpcionalNaoFutura,
  assoc_diretoria: zDataYmdOpcionalNaoFutura,
  dir_p_nome: z.string().optional(),
  dir_p_tel: z.string().optional(),
  dir_p_nasc: zDataYmdOpcionalNaoFutura,
  dir_vp_nome: z.string().optional(),
  dir_vp_tel: z.string().optional(),
  dir_vp_nasc: zDataYmdOpcionalNaoFutura,
  dir_t_nome: z.string().optional(),
  dir_t_tel: z.string().optional(),
  dir_t_nasc: zDataYmdOpcionalNaoFutura,
  dir_t2_nome: z.string().optional(),
  dir_t2_tel: z.string().optional(),
  dir_t2_nasc: zDataYmdOpcionalNaoFutura,
  dir_s_nome: z.string().optional(),
  dir_s_tel: z.string().optional(),
  dir_s_nasc: zDataYmdOpcionalNaoFutura,
  dir_s2_nome: z.string().optional(),
  dir_s2_tel: z.string().optional(),
  dir_s2_nasc: zDataYmdOpcionalNaoFutura,
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
  .merge(stepEmpregabilidadeSchema)
  .merge(stepPecuariaSchema)
  .merge(stepAgriculturaSchema)
  .merge(stepAssociacaoSchema)
  .merge(stepAssinaturaSchema);

/** Valores fixos do diagnóstico + chaves dinâmicas das perguntas extras do painel. */
export type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema> & {
  [key: string]: string | number | string[] | undefined;
};

export const stepSchemas = [
  stepIdentificationSchema,
  stepFamiliesSchema,
  stepCasasSchema,
  stepHidricoSchema,
  stepEmpregabilidadeSchema,
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
  "Empregabilidade",
  "Pecuária e produção",
  "Agricultura",
  "Associação",
  "Assinatura",
] as const;

export const WIZARD_STEP_COUNT = STEP_LABELS.length;

/** Validação para conclusão (assinatura obrigatória + canvas) */
export const completeDiagnosisSchema = diagnosisFormSchema.superRefine(
  (data, ctx) => {
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
        message: "É necessário assinar no quadro de assinatura digital acima para concluir.",
        path: ["signature_data_url"],
      });
    }
  },
);

export function getDefaultDiagnosisValues(): DiagnosisFormValues {
  return {
    comunidade: "",
    distrito: "",
    data_coleta: "",
    observacoes: "",
    pesquisador: "",
    gps: "",
    vizinha_leste: "",
    vizinha_oeste: "",
    vizinha_norte: "",
    vizinha_sul: "",
    familias_socias: 0,
    familias_nao_socias: 0,
    casas_total: 0,
    casas_alvenaria: 0,
    casas_alvenaria_sem_morador: 0,
    casas_taipa: 0,
    casas_taipa_sem_morador: 0,
    sem_caixa: 0,
    sem_banheiro: 0,
    sem_energia: 0,
    sem_fossa: 0,
    sem_agua: 0,
    energia_trifasica: "nao",
    trator_publico: 0,
    trator_particular: 0,
    cist_placa: 0,
    cist_enxurrada: 0,
    cist_alvenaria: 0,
    cist_comunitarias: 0,
    cist_sem_placa: 0,
    poco_publico: 0,
    poco_particular: 0,
    poco_func: 0,
    poco_obstruido: 0,
    poco_dessal: 0,
    poco_seco: 0,
    abast_possui: "nao",
    abast_func: "nao",
    abast_motivo: "",
    cacimba_publico: 0,
    cacimba_particular: 0,
    cacimba: 0,
    barragens_sub_publico: 0,
    barragens_sub_particular: 0,
    barragens_sub: 0,
    cacimbao_publico: 0,
    cacimbao_particular: 0,
    cacimbao_alv: 0,
    acude_com: 0,
    acude_part: 0,
    emp_familias_artesao: "",
    emp_pessoas_na_comunidade: 0,
    emp_pessoas_fora_comunidade: 0,
    pec_apicultura: 0,
    pec_asininos: 0,
    pec_bovinos: 0,
    pec_caprinos: 0,
    pec_equinos: 0,
    pec_muares: 0,
    pec_galinhas: 0,
    pec_ovinos: 0,
    pec_suinos: 0,
    prod_leite_l_dia: 0,
    prod_mel_l_ano: 0,
    prod_ovos_un_dia: 0,
    agr_milho: 0,
    agr_feijao: 0,
    agr_fava: 0,
    agr_algodao: 0,
    agr_mamona: 0,
    agr_mandioca: 0,
    agr_acerola: 0,
    agr_banana: 0,
    agr_caju: 0,
    agr_mamao: 0,
    agr_goiaba: 0,
    agr_hortalicas: 0,
    agr_batata_doce: 0,
    agr_palma: 0,
    agr_capim_elefante: 0,
    assoc_nome: "",
    assoc_cnpj: "",
    assoc_sede_propria: "nao",
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

/** Preenche campos novos ao abrir diagnósticos antigos no wizard. */
export function mergeDiagnosisPayload(
  payload: Partial<DiagnosisFormValues> | Record<string, unknown>,
): DiagnosisFormValues {
  return { ...getDefaultDiagnosisValues(), ...payload } as DiagnosisFormValues;
}
