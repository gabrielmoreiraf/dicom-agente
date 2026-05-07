import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WizardStepRouter } from "@/features/diagnoses/wizard/WizardStepRouter";
import { getDefaultDiagnosisValues, mergeDiagnosisPayload } from "@/schemas/diagnosis";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import {
  applyExtraDefaultsToForm,
  loadDiagnosisFormTemplate,
  splitExtraTemplateFields,
} from "@/features/forms/services/formTemplateCampo";
import { isFormsModuleEnabled } from "@/lib/featureFlags";
import {
  buildCompleteDiagnosisSchema,
  getSchemaForWizardStep,
  getWizardLayout,
} from "@/features/forms/wizardLayout";
import { DraftSaveDialog } from "@/features/diagnoses/components/DraftSaveDialog";
import {
  canEditDiagnosis,
  createDraft,
  getDiagnosis,
  savePayload,
} from "@/features/diagnoses/services/diagnosisService";
import { formatDefaultDraftTitle } from "@/lib/draftDefaultTitle";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import {
  queueDiagnosisSync,
  syncPendingDiagnoses,
} from "@/features/diagnoses/services/syncService";
import { useAuth } from "@/features/auth/AuthContext";
import { useWizardAutosave } from "@/features/diagnoses/hooks/useWizardAutosave";
import { applyZodIssuesToForm } from "@/utils/zodToRhf";
import styles from "./DiagnosisWizardPage.module.css";

const WIZARD_NOVO_SESSION_KEY = "diagnostico_wizard_novo_local_id";

/** Após criar o primeiro rascunho a partir de `/diagnostico/novo`, restaura a etapa (troca de rota pode remontar o componente). */
function wizardStepSessionKey(localId: string) {
  return `wizard-pending-step:${localId}`;
}

function isNewDiagnosisPath(pathname: string) {
  return pathname.replace(/\/+$/, "").endsWith("/diagnostico/novo");
}

export function DiagnosisWizardPage() {
  const { localId } = useParams<{ localId: string }>();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const online = useOnlineStatus();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [stepValidationMessage, setStepValidationMessage] = useState<string | null>(null);
  const [draftSaveOpen, setDraftSaveOpen] = useState(false);
  const [draftTitleInitial, setDraftTitleInitial] = useState("");

  const isNewWizard = isNewDiagnosisPath(pathname);

  const { data: record, isLoading } = useQuery({
    queryKey: ["diagnosis", localId],
    queryFn: () => getDiagnosis(localId!),
    enabled: !!localId,
  });

  const formsModuleOn = isFormsModuleEnabled();

  const { data: formTemplate, isLoading: formTemplateLoading } = useQuery({
    queryKey: ["form-template-campo", formsModuleOn],
    queryFn: loadDiagnosisFormTemplate,
    staleTime: 5 * 60_000,
    retry: formsModuleOn ? 1 : 0,
    enabled: formsModuleOn,
  });

  const extraFields = useMemo(
    () => splitExtraTemplateFields(formTemplate?.fields ?? []),
    [formTemplate],
  );
  const layout = useMemo(
    () => getWizardLayout(extraFields.length),
    [extraFields.length],
  );
  const completeSchema = useMemo(
    () => buildCompleteDiagnosisSchema(extraFields),
    [extraFields],
  );

  const form = useForm<DiagnosisFormValues>({
    defaultValues: getDefaultDiagnosisValues(),
  });

  const {
    reset,
    getValues,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { isDirty },
  } = form;

  useLayoutEffect(() => {
    if (!localId) return;
    const raw = sessionStorage.getItem(wizardStepSessionKey(localId));
    if (!raw) return;
    sessionStorage.removeItem(wizardStepSessionKey(localId));
    const n = Number(raw);
    if (n >= 1 && n <= layout.stepCount) setStep(n);
  }, [localId, layout.stepCount]);

  useEffect(() => {
    if (!record) return;
    if (isDirty) return;
    const base = mergeDiagnosisPayload(record.payload);
    const withExtras = formsModuleOn
      ? applyExtraDefaultsToForm(extraFields, base)
      : base;
    reset(withExtras as DiagnosisFormValues);
  }, [record, formTemplate, extraFields, formsModuleOn, reset, isDirty]);

  /** Cria `localId` imediatamente em `/diagnostico/novo` e redireciona — habilita autosave e evita dados só em memória. */
  useEffect(() => {
    if (!isNewWizard) return;

    let cancelled = false;

    void (async () => {
      try {
        let id = sessionStorage.getItem(WIZARD_NOVO_SESSION_KEY);
        if (!id) {
          id = await createDraft();
          sessionStorage.setItem(WIZARD_NOVO_SESSION_KEY, id);
        }
        const row = await getDiagnosis(id);
        if (!row) {
          sessionStorage.removeItem(WIZARD_NOVO_SESSION_KEY);
          if (!cancelled) {
            window.alert("Não foi possível iniciar o rascunho. Tente novamente.");
          }
          return;
        }
        if (cancelled) return;
        await qc.invalidateQueries({ queryKey: ["diagnoses"] });
        if (cancelled) return;
        nav(`/diagnostico/${id}`, { replace: true });
      } catch (e) {
        sessionStorage.removeItem(WIZARD_NOVO_SESSION_KEY);
        if (!cancelled) {
          window.alert(e instanceof Error ? e.message : "Não foi possível iniciar o rascunho.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isNewWizard, nav, qc]);

  useEffect(() => {
    if (localId && !isNewDiagnosisPath(pathname)) {
      sessionStorage.removeItem(WIZARD_NOVO_SESSION_KEY);
    }
  }, [localId, pathname]);

  const lockedReadOnly = record ? !canEditDiagnosis(record) : false;
  const viewOnlyByChoice = searchParams.get("visualizar") === "1";
  const readOnly = lockedReadOnly || viewOnlyByChoice;

  /** Depois do `useEffect` que faz `reset` condicional ao `record` / `isDirty`. */
  const { autosaveError, persistAfterStepNav, syncBaselineFromForm } = useWizardAutosave({
    form,
    localId,
    record,
    readOnly,
    debounceMs: 550,
    queryClient: qc,
    flushOnBeforeUnload: true,
  });

  const goNext = async () => {
    const schema = getSchemaForWizardStep(step, layout, extraFields);
    if (!schema) return;
    const r = schema.safeParse(getValues());
    if (!r.success) {
      applyZodIssuesToForm(r.error, setError);
      const msgs = r.error.issues.map((i) => i.message).filter(Boolean);
      setStepValidationMessage(
        msgs.length > 0 ? msgs.join(" ") : "Corrija os campos obrigatórios antes de avançar.",
      );
      return;
    }
    clearErrors();
    setStepValidationMessage(null);

    if (!localId) {
      window.alert("Aguarde a preparação do rascunho no aparelho.");
      return;
    }

    try {
      await persistAfterStepNav();
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "Não foi possível salvar o rascunho ao avançar a etapa.",
      );
      return;
    }

    setStep((s) => Math.min(layout.stepCount, s + 1));
  };

  const goPrev = async () => {
    clearErrors();
    setStepValidationMessage(null);

    if (!isNewWizard && localId) {
      try {
        await persistAfterStepNav();
      } catch (e) {
        window.alert(
          e instanceof Error ? e.message : "Não foi possível salvar o rascunho ao voltar a etapa.",
        );
        return;
      }
    }

    setStep((s) => Math.max(1, s - 1));
  };

  useEffect(() => {
    if (readOnly) return;
    const name = user?.name?.trim();
    if (!name) return;
    setValue("pesquisador", name, { shouldDirty: false, shouldValidate: false });
    setValue("resp_nome", name, { shouldDirty: false, shouldValidate: false });
  }, [readOnly, user?.name, record, setValue]);

  const signatureWatch = watch("signature_data_url");
  useEffect(() => {
    if (step !== layout.assinaturaStep) return;
    if (signatureWatch?.trim()) setStepValidationMessage(null);
  }, [signatureWatch, step, layout.assinaturaStep]);

  const wizardTitle = readOnly
    ? "Visualizar diagnóstico"
    : isNewWizard || (record?.status === "draft" && !(record.has_been_completed ?? false))
      ? "Novo diagnóstico"
      : "Editar diagnóstico";

  const openDraftSaveDialog = () => {
    if (readOnly) return;
    const v = getValues();
    setDraftTitleInitial(record?.draft_title?.trim() || formatDefaultDraftTitle(v));
    setDraftSaveOpen(true);
  };

  const runSaveDraft = async (draftTitle: string) => {
    if (readOnly) return;
    if (!localId) return;
    try {
      await savePayload(localId, getValues(), "draft", { draftTitle });
      await qc.invalidateQueries({ queryKey: ["diagnoses"] });
      await qc.invalidateQueries({ queryKey: ["diagnosis", localId] });
      syncBaselineFromForm();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Não foi possível salvar.");
      throw e;
    }
  };

  const onFinish = async () => {
    if (!localId || readOnly) return;
    setStepValidationMessage(null);
    const r = completeSchema.safeParse(getValues());
    if (!r.success) {
      applyZodIssuesToForm(r.error, setError);
      const msgs = r.error.issues.map((i) => i.message).filter(Boolean);
      setStepValidationMessage(
        msgs.length > 0 ? msgs.join(" ") : "Corrija os campos obrigatórios antes de concluir.",
      );
      return;
    }
    try {
      await savePayload(localId, r.data, "completed");
      syncBaselineFromForm();
      await queueDiagnosisSync(localId);
      if (online) {
        await syncPendingDiagnoses();
      }
      await qc.invalidateQueries({ queryKey: ["diagnoses"] });
      nav("/diagnosticos");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Não foi possível concluir.");
    }
  };

  if (!localId && !isNewWizard) return <Navigate to="/" replace />;

  if (isNewWizard) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        Preparando rascunho…
      </div>
    );
  }

  if (!isNewWizard && (isLoading || (formsModuleOn && formTemplateLoading))) {
    return <div className={styles.loading}>Carregando…</div>;
  }

  if (formsModuleOn && !isNewWizard && !formTemplate) {
    return (
      <div className={styles.notFound}>
        Não foi possível carregar o formulário. Verifique a conexão e tente novamente.
      </div>
    );
  }

  if (!isNewWizard && !record) {
    return <div className={styles.notFound}>Diagnóstico não encontrado.</div>;
  }

  if (readOnly && record) {
    return (
      <FormProvider {...form}>
        <div className={styles.readRoot}>
          <header>
            <h1 className={styles.readTitle}>{wizardTitle}</h1>
            <p className={styles.readSub}>
              Visualização completa — role a página para ver todas as seções.
            </p>
            {lockedReadOnly ? (
              <p className={styles.warn}>
                Limite de edições após conclusão atingido. Os dados abaixo são somente leitura.
              </p>
            ) : null}
          </header>

          <fieldset disabled className={`${styles.fieldsetRead} ${styles.fieldsetReadDisabled}`}>
            {layout.labels.map((label, i) => (
              <section key={`${label}-${i}`} className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {i + 1}. {label}
                </h2>
                <WizardStepRouter
                  uiStep={i + 1}
                  layout={layout}
                  extraFields={extraFields}
                />
              </section>
            ))}
          </fieldset>

          <div className={styles.footerRead}>
            <button
              type="button"
              onClick={() => nav("/diagnosticos")}
              className={styles.btnBackWide}
            >
              Voltar
            </button>
          </div>
        </div>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...form}>
      <div className={styles.editRoot}>
        <header className={styles.editHeader}>
          <p className={styles.kicker}>Formulário de coleta</p>
          <h1 className={styles.editTitle}>{wizardTitle}</h1>
          <p className={styles.editSub}>
            Etapa {step} de {layout.stepCount} · {layout.labels[step - 1]}
          </p>
        </header>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(step / layout.stepCount) * 100}%` }}
          />
        </div>

        {stepValidationMessage ? (
          <p className={styles.validationBanner} role="alert">
            {stepValidationMessage}
          </p>
        ) : null}

        {autosaveError ? (
          <p className={styles.validationBanner} role="alert">
            Não foi possível salvar automaticamente: {autosaveError}
          </p>
        ) : null}

        <fieldset className={styles.fieldset}>
          <WizardStepRouter uiStep={step} layout={layout} extraFields={extraFields} />
        </fieldset>

        <div className={styles.btnRow}>
          {step > 1 && (
            <button type="button" onClick={() => void goPrev()} className={styles.btnGhost}>
              Voltar
            </button>
          )}
          {step < layout.stepCount && (
            <button type="button" onClick={() => void goNext()} className={styles.btnPrimary}>
              {step === layout.assinaturaStep - 1 ? "Revisão" : "Avançar"}
            </button>
          )}
        </div>

        {step === layout.assinaturaStep ? (
          <>
            <div className={styles.offlineHintCard} role="note">
              <strong>Sem internet?</strong> Use <strong>Salvar rascunho</strong> para guardar no aparelho
              e nomear o registro. Depois sincronize em <strong>Sincronização</strong> ou quando a rede
              voltar.
            </div>
            <div className={styles.row8}>
              <button type="button" onClick={openDraftSaveDialog} className={styles.btnDraft}>
                Salvar rascunho
              </button>
              <button type="button" onClick={() => void onFinish()} className={styles.btnFinish}>
                Concluir
              </button>
            </div>
          </>
        ) : null}

        <DraftSaveDialog
          open={draftSaveOpen}
          onOpenChange={setDraftSaveOpen}
          initialTitle={draftTitleInitial}
          onConfirm={(title) => runSaveDraft(title)}
        />
      </div>
    </FormProvider>
  );
}
