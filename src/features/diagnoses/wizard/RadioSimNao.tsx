import { useFormContext } from "react-hook-form";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import wc from "./wizardCommon.module.css";

const options = [
  { v: "sim" as const, l: "Sim" },
  { v: "nao" as const, l: "Não" },
];

export type SimNaoFieldName =
  | "abast_possui"
  | "abast_func"
  | "energia_trifasica"
  | "assoc_sede_propria";

export function RadioSimNao({ name }: { name: SimNaoFieldName }) {
  const { register } = useFormContext<DiagnosisFormValues>();
  return (
    <div className={wc.radioRow}>
      {options.map(({ v, l }) => (
        <label key={v} className={wc.radioLabel}>
          <input type="radio" value={v} {...register(name)} />
          <span className={wc.radioText}>{l}</span>
        </label>
      ))}
    </div>
  );
}
