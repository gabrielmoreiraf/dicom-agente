import { NumericField, type DiagnosisNumericPath } from "@/features/diagnoses/wizard/NumericField";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import wc from "./wizardCommon.module.css";

const criacao: [DiagnosisNumericPath, string][] = [
  ["pec_apicultura", "Apicultura"],
  ["pec_asininos", "Asininos / jumentos"],
  ["pec_bovinos", "Bovinos"],
  ["pec_caprinos", "Caprinos"],
  ["pec_equinos", "Equinos / cavalos"],
  ["pec_muares", "Muares / burros"],
  ["pec_galinhas", "Galinhas (famílias)"],
  ["pec_ovinos", "Ovinos"],
  ["pec_suinos", "Suínos"],
];

const producao: [DiagnosisNumericPath, string][] = [
  ["prod_leite_l_dia", "Leite (L/dia)"],
  ["prod_mel_l_ano", "Mel (L/ano)"],
  ["prod_ovos_un_dia", "Ovos (unid./dia)"],
];

export function StepPecuaria() {
  return (
    <div className={wc.spaceY6}>
      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Famílias que criam</h3>
        <div className={wc.gridSm2}>
          {criacao.map(([name, label]) => (
            <label key={String(name)} className={wc.block}>
              <span className={wc.labelSm}>{label}</span>
              <NumericField name={name} className={field} />
            </label>
          ))}
        </div>
      </section>
      <section className={wc.section}>
        <h3 className={wc.sectionTitle}>Produção da comunidade</h3>
        <div className={wc.gridSm2}>
          {producao.map(([name, label]) => (
            <label key={String(name)} className={wc.block}>
              <span className={wc.labelSm}>{label}</span>
              <NumericField name={name} className={field} />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
