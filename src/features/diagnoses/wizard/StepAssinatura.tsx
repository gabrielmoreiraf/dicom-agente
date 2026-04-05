import { Controller, useFormContext } from "react-hook-form";
import { SignatureCanvas } from "@/features/diagnoses/components/SignatureCanvas";
import { formatIsoDateBR } from "@/lib/formatIsoDateBR";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import wc from "./wizardCommon.module.css";

export function StepAssinatura() {
  const { control, watch, clearErrors, formState } = useFormContext<DiagnosisFormValues>();
  const values = watch();
  const signatureError = formState.errors.signature_data_url?.message;

  const dataLabel = values.data_coleta
    ? formatIsoDateBR(values.data_coleta) || values.data_coleta
    : "";

  const summary = [
    ["Comunidade", values.comunidade],
    ["Data", dataLabel],
    ["Pesquisador", values.pesquisador],
    ["Responsável pelas informações", values.resp_nome],
  ].filter(([, v]) => v);

  return (
    <div className={wc.spaceY6}>
      <div>
        <span className={wc.labelSignature}>Assinatura digital</span>
        <Controller
          name="signature_data_url"
          control={control}
          render={({ field: f }) => (
            <SignatureCanvas
              value={f.value}
              onChange={(v) => {
                f.onChange(v);
                if (v?.trim()) clearErrors("signature_data_url");
              }}
            />
          )}
        />
        {signatureError ? (
          <p className={wc.signatureFieldError} role="alert">
            {signatureError}
          </p>
        ) : null}
      </div>

      <div className={wc.summaryCard}>
        <h3 className={wc.summaryTitle}>Resumo</h3>
        <dl className={wc.dl}>
          {summary.map(([k, v]) => (
            <div key={k} className={wc.dlRow}>
              <dt className={wc.dt}>{k}</dt>
              <dd className={wc.dd}>{String(v)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
