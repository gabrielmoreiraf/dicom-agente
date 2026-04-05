import { useEffect, useLayoutEffect, useState } from "react";
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
import {
  completeDiagnosisSchema,
  getDefaultDiagnosisValues,
  STEP_LABELS,
  stepSchemas,
} from "@/schemas/diagnosis";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
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
import { applyZodIssuesToForm } from "@/utils/zodToRhf";
import styles from "./DiagnosisWizardPage.module.css";

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

  const form = useForm<DiagnosisFormValues>({
    defaultValues: getDefaultDiagnosisValues(),
  });

  const { reset, getValues, setError, clearErrors } = form;

  useLayoutEffect(() => {
    if (!localId) return;
    const raw = sessionStorage.getItem(wizardStepSessionKey(localId));
    if (!raw) return;
    sessionStorage.removeItem(wizardStepSessionKey(localId));
    const n = Number(raw);
    if (n >= 1 && n <= 8) setStep(n);
  }, [localId]);

  useEffect(() => {
    if (record) reset(record.payload);
  }, [record, reset]);

  const persistNewDraftAndGoToUrl = async (nextStep: number, draftTitle?: string) => {
    const id = await createDraft();
    await savePayload(
      id,
      getValues(),
      "draft",
      draftTitle !== undefined ? { draftTitle } : undefined,
    );
    await qc.invalidateQueries({ queryKey: ["diagnoses"] });
    sessionStorage.setItem(wizardStepSessionKey(id), String(nextStep));
    nav(`/diagnostico/${id}`, { replace: true });
  };

  const goNext = async () => {
    const schema = stepSchemas[step - 1];
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

    if (isNewWizard) {
      try {
        await persistNewDraftAndGoToUrl(step + 1);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "Não foi possível salvar.");
      }
      return;
    }

    setStep((s) => Math.min(8, s + 1));
  };

  const goPrev = () => {
    clearErrors();
    setStepValidationMessage(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const lockedReadOnly = record ? !canEditDiagnosis(record) : false;
  const viewOnlyByChoice = searchParams.get("visualizar") === "1";
  const readOnly = lockedReadOnly || viewOnlyByChoice;

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
    try {
      if (isNewWizard) {
        await persistNewDraftAndGoToUrl(step, draftTitle);
      } else if (localId) {
        await savePayload(localId, getValues(), "draft", { draftTitle });
        await qc.invalidateQueries({ queryKey: ["diagnoses"] });
        await qc.invalidateQueries({ queryKey: ["diagnosis", localId] });
      }
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Não foi possível salvar.");
      throw e;
    }
  };

  const onFinish = async () => {
    if (!localId || readOnly) return;
    const r = completeDiagnosisSchema.safeParse(getValues());
    if (!r.success) {
      applyZodIssuesToForm(r.error, setError);
      return;
    }
    try {
      await savePayload(localId, r.data, "completed");
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

  if (!isNewWizard && isLoading) {
    return <div className={styles.loading}>Carregando…</div>;
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
            {STEP_LABELS.map((label, i) => (
              <section key={label} className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {i + 1}. {label}
                </h2>
                <WizardStepRouter step={i + 1} />
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
            Etapa {step} de 8 · {STEP_LABELS[step - 1]}
          </p>
        </header>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>

        {stepValidationMessage ? (
          <p className={styles.validationBanner} role="alert">
            {stepValidationMessage}
          </p>
        ) : null}

        <fieldset className={styles.fieldset}>
          <WizardStepRouter step={step} />
        </fieldset>

        <div className={styles.btnRow}>
          {step > 1 && (
            <button type="button" onClick={goPrev} className={styles.btnGhost}>
              Voltar
            </button>
          )}
          {step < 8 && (
            <button type="button" onClick={() => void goNext()} className={styles.btnPrimary}>
              {step === 7 ? "Revisão" : "Avançar"}
            </button>
          )}
        </div>

        {step === 8 ? (
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
