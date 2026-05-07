import { NumericField, type DiagnosisNumericPath } from "@/features/diagnoses/wizard/NumericField";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import wc from "./wizardCommon.module.css";

const fields: [DiagnosisNumericPath, string][] = [
  ["agr_milho", "Milho"],
  ["agr_feijao", "Feijão"],
  ["agr_fava", "Fava"],
  ["agr_algodao", "Algodão"],
  ["agr_mamona", "Mamona"],
  ["agr_mandioca", "Mandioca / macaxeira"],
  ["agr_acerola", "Acerola"],
  ["agr_banana", "Banana"],
  ["agr_caju", "Caju"],
  ["agr_mamao", "Mamão"],
  ["agr_goiaba", "Goiaba"],
  ["agr_hortalicas", "Hortaliças"],
  ["agr_batata_doce", "Batata doce"],
  ["agr_palma", "Palma"],
  ["agr_capim_elefante", "Capim-elefante"],
];

export function StepAgricultura() {
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
