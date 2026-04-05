import { useFormContext } from "react-hook-form";
import { NumericField } from "@/features/diagnoses/wizard/NumericField";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import wc from "./wizardCommon.module.css";

export function StepFamilies() {
  const { watch } = useFormContext<DiagnosisFormValues>();
  const s = Number(watch("familias_socias")) || 0;
  const n = Number(watch("familias_nao_socias")) || 0;

  return (
    <div className={`${wc.maxWmd} ${wc.stack4}`}>
      <label className={wc.block}>
        <span className={wc.labelSm}>Famílias sócias</span>
        <NumericField name="familias_socias" className={field} />
      </label>
      <label className={wc.block}>
        <span className={wc.labelSm}>Famílias não sócias</span>
        <NumericField name="familias_nao_socias" className={field} />
      </label>
      <div className={wc.totalCard}>
        <div className={wc.totalLabel}>Total de famílias</div>
        <div className={wc.totalValue}>{s + n}</div>
      </div>
    </div>
  );
}
