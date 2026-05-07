import { useFormContext } from "react-hook-form";
import { NumericField, type DiagnosisNumericPath } from "@/features/diagnoses/wizard/NumericField";
import { RadioSimNao } from "@/features/diagnoses/wizard/RadioSimNao";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import wc from "./wizardCommon.module.css";

export function StepHidrico() {
  const { register } = useFormContext<DiagnosisFormValues>();

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
          {mini("cist_sem_placa", "Casas sem cisterna de placa")}
        </div>
      </section>

      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Poços profundos</h3>
        <div className={wc.sectionGrid}>
          {mini("poco_publico", "Público")}
          {mini("poco_particular", "Particular")}
          {mini("poco_func", "Funcionando")}
          {mini("poco_obstruido", "Obstruído")}
          {mini("poco_dessal", "Com dessalinizador")}
          {mini("poco_seco", "Seco")}
        </div>
      </section>

      <section className={wc.section}>
        <h3 className={wc.sectionTitlePlain}>Sistema de abastecimento</h3>
        <p className={wc.prompt}>Possui sistema?</p>
        <RadioSimNao name="abast_possui" />
        <p className={wc.promptSpaced}>Funcionando?</p>
        <RadioSimNao name="abast_func" />
        <label className={`${wc.block} ${wc.promptSpaced}`}>
          <span className={wc.labelXs}>Motivo (se não funciona)</span>
          <input {...register("abast_motivo")} className={field} />
        </label>
      </section>

      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Cacimbas</h3>
        <div className={wc.sectionGrid}>
          {mini("cacimba_publico", "Público")}
          {mini("cacimba_particular", "Particular")}
        </div>
      </section>

      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Cacimbões</h3>
        <div className={wc.sectionGrid}>
          {mini("cacimbao_publico", "Público")}
          {mini("cacimbao_particular", "Particular")}
          {mini("cacimbao_alv", "De alvenaria")}
        </div>
      </section>

      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Barragens subterrâneas</h3>
        <div className={wc.sectionGrid}>
          {mini("barragens_sub_publico", "Público")}
          {mini("barragens_sub_particular", "Particular")}
        </div>
      </section>

      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Açudes</h3>
        <div className={wc.sectionGrid}>
          {mini("acude_com", "Comunitários")}
          {mini("acude_part", "Particulares")}
        </div>
      </section>
    </div>
  );
}
