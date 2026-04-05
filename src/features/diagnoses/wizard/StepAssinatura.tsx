import { Controller, useFormContext } from "react-hook-form";
import { SignatureCanvas } from "@/features/diagnoses/components/SignatureCanvas";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import { formatIsoDateBR } from "@/lib/formatIsoDateBR";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import wc from "./wizardCommon.module.css";

export function StepAssinatura() {
  const { register, control, watch } = useFormContext<DiagnosisFormValues>();
  const values = watch();

  const dataLabel = values.data_coleta
    ? formatIsoDateBR(values.data_coleta) || values.data_coleta
    : "";

  const summary = [
    ["Comunidade", values.comunidade],
    ["Data", dataLabel],
    ["Pesquisador", values.pesquisador],
  ].filter(([, v]) => v);

  return (
    <div className={wc.spaceY6}>
      <label className={wc.block}>
        <span className={wc.labelMd}>Nome do responsável pelas informações</span>
        <input {...register("resp_nome")} className={field} />
      </label>

      <div>
        <span className={wc.labelSignature}>Assinatura digital</span>
        <Controller
          name="signature_data_url"
          control={control}
          render={({ field: f }) => (
            <SignatureCanvas value={f.value} onChange={f.onChange} />
          )}
        />
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
