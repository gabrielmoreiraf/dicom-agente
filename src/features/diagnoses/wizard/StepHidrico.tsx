import { useFormContext } from "react-hook-form";
import { NumericField, type DiagnosisNumericPath } from "@/features/diagnoses/wizard/NumericField";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import wc from "./wizardCommon.module.css";

const simNao = [
  { v: "sim" as const, l: "Sim" },
  { v: "nao" as const, l: "Não" },
];

function RadioPair({ name }: { name: "abast_possui" | "abast_func" }) {
  const { register } = useFormContext<DiagnosisFormValues>();
  return (
    <div className={wc.radioRow}>
      {simNao.map(({ v, l }) => (
        <label key={v} className={wc.radioLabel}>
          <input type="radio" value={v} {...register(name)} />
          <span className={wc.radioText}>{l}</span>
        </label>
      ))}
    </div>
  );
}

export function StepHidrico() {
  const mini = (name: DiagnosisNumericPath, label: string) => (
    <label key={String(name)} className={wc.block}>
      <span className={wc.labelXs}>{label}</span>
      <NumericField name={name} className={field} />
    </label>
  );

  return (
    <div className={wc.spaceY6}>
      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Cisternas</h3>
        <div className={wc.sectionGrid}>
          {mini("cist_placa", "Placa")}
          {mini("cist_enxurrada", "Enxurrada / calçadão")}
          {mini("cist_alvenaria", "Alvenaria")}
          {mini("cist_comunitarias", "Comunitárias")}
        </div>
      </section>

      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Poços profundos</h3>
        <div className={wc.sectionGrid}>
          {mini("poco_func", "Funcionando")}
          {mini("poco_obstruido", "Obstruído")}
          {mini("poco_dessal", "Com dessalinizador")}
          {mini("poco_seco", "Seco")}
        </div>
      </section>

      <section className={wc.section}>
        <h3 className={wc.sectionTitlePlain}>Sistema de abastecimento</h3>
        <p className={wc.prompt}>Possui sistema?</p>
        <RadioPair name="abast_possui" />
        <p className={wc.promptSpaced}>Funcionando?</p>
        <RadioPair name="abast_func" />
      </section>

      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Outros</h3>
        <div className={wc.sectionGrid}>
          {mini("cacimba", "Cacimba")}
          {mini("barragens_sub", "Barragens subterrâneas")}
          {mini("cacimbao_alv", "Cacimbão de alvenaria")}
          {mini("acude_com", "Açudes comunitários")}
          {mini("acude_part", "Açudes particulares")}
        </div>
      </section>
    </div>
  );
}
