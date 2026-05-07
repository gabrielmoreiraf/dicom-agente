import { useFormContext } from "react-hook-form";
import { NumericField } from "@/features/diagnoses/wizard/NumericField";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import wc from "./wizardCommon.module.css";

export function StepEmpregabilidade() {
  const { register } = useFormContext<DiagnosisFormValues>();

  return (
    <div className={wc.spaceY6}>
      <label className={wc.block}>
        <span className={wc.labelSm}>
          Famílias que trabalham com artesanato (descrição / quantidade)
        </span>
        <input {...register("emp_familias_artesao")} className={field} placeholder="Ex.: costura — 18" />
      </label>
      <div className={wc.sectionGrid}>
        <label className={wc.block}>
          <span className={wc.labelSm}>Pessoas que trabalham na comunidade</span>
          <NumericField name="emp_pessoas_na_comunidade" className={field} />
        </label>
        <label className={wc.block}>
          <span className={wc.labelSm}>Pessoas que trabalham fora da comunidade</span>
          <NumericField name="emp_pessoas_fora_comunidade" className={field} />
        </label>
      </div>
    </div>
  );
}
