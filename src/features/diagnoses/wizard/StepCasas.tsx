import { NumericField, type DiagnosisNumericPath } from "@/features/diagnoses/wizard/NumericField";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import wc from "./wizardCommon.module.css";

const nums: [DiagnosisNumericPath, string][] = [
  ["casas_total", "Total de casas"],
  ["casas_alvenaria", "Alvenaria / tijolo"],
  ["casas_taipa", "Taipa"],
  ["sem_caixa", "Sem caixa d'água"],
  ["sem_banheiro", "Sem banheiro"],
  ["sem_energia", "Sem energia"],
  ["sem_fossa", "Sem fossa"],
  ["sem_agua", "Sem água encanada"],
];

export function StepCasas() {
  return (
    <div className={wc.gridSm2}>
      {nums.map(([name, label]) => (
        <label key={name} className={wc.block}>
          <span className={wc.labelSm}>{label}</span>
          <NumericField name={name} className={field} />
        </label>
      ))}
    </div>
  );
}
