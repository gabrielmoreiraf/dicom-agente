import { NumericField, type DiagnosisNumericPath } from "@/features/diagnoses/wizard/NumericField";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import wc from "./wizardCommon.module.css";

const fields: [DiagnosisNumericPath, string][] = [
  ["pec_asininos", "Asininos / jumentos"],
  ["pec_bovinos", "Bovinos"],
  ["pec_caprinos", "Caprinos"],
  ["pec_equinos", "Equinos / cavalos"],
  ["pec_galinhas", "Galinhas"],
  ["pec_ovinos", "Ovinos"],
  ["pec_suinos", "Suínos"],
];

export function StepPecuaria() {
  return (
    <div className={wc.gridSm2}>
      {fields.map(([name, label]) => (
        <label key={String(name)} className={wc.block}>
          <span className={wc.labelSm}>{label}</span>
          <NumericField name={name} className={field} />
        </label>
      ))}
    </div>
  );
}
