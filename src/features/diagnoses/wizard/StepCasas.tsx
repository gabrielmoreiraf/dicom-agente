import { NumericField, type DiagnosisNumericPath } from "@/features/diagnoses/wizard/NumericField";
import { RadioSimNao } from "@/features/diagnoses/wizard/RadioSimNao";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import wc from "./wizardCommon.module.css";

const nums: [DiagnosisNumericPath, string][] = [
  ["casas_total", "Total de casas"],
  ["casas_alvenaria", "Alvenaria / tijolo"],
  ["casas_alvenaria_sem_morador", "Alvenaria sem morador"],
  ["casas_taipa", "Taipa"],
  ["casas_taipa_sem_morador", "Taipa sem morador"],
  ["sem_caixa", "Sem caixa d'água"],
  ["sem_banheiro", "Sem banheiro"],
  ["sem_energia", "Sem energia"],
  ["sem_fossa", "Sem fossa"],
  ["sem_agua", "Sem água encanada"],
];

export function StepCasas() {
  return (
    <div className={wc.spaceY6}>
      <div className={wc.gridSm2}>
        {nums.map(([name, label]) => (
          <label key={name} className={wc.block}>
            <span className={wc.labelSm}>{label}</span>
            <NumericField name={name} className={field} />
          </label>
        ))}
      </div>
      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Energia e maquinário</h3>
        <p className={wc.prompt}>Tem energia trifásica na comunidade?</p>
        <RadioSimNao name="energia_trifasica" />
        <div className={`${wc.sectionGrid} ${wc.promptSpaced}`}>
          <label className={wc.block}>
            <span className={wc.labelXs}>Tratores — público</span>
            <NumericField name="trator_publico" className={field} />
          </label>
          <label className={wc.block}>
            <span className={wc.labelXs}>Tratores — particular</span>
            <NumericField name="trator_particular" className={field} />
          </label>
        </div>
      </section>
    </div>
  );
}
