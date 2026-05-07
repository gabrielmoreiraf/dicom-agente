import { useFormContext } from "react-hook-form";
import type { FormTemplateField } from "@/domain/formTemplate";
import { DynamicExtraField } from "@/features/diagnoses/wizard/DynamicExtraField";
import wc from "./wizardCommon.module.css";

type Props = {
  fields: FormTemplateField[];
};

export function StepExtras({ fields }: Props) {
  const {
    formState: { errors },
  } = useFormContext();

  if (fields.length === 0) {
    return (
      <p className={wc.labelSm}>
        Nenhuma pergunta extra configurada no painel da prefeitura.
      </p>
    );
  }

  const rootErr = errors.root?.message;

  return (
    <div className={`${wc.maxWmd} ${wc.stack4}`}>
      <p className={wc.labelSm}>
        Perguntas adicionais definidas pela prefeitura. Preencha conforme a coleta em campo.
      </p>
      {fields.map((f) => (
        <DynamicExtraField key={f.id} def={f} />
      ))}
      {rootErr ? <p className={wc.errorBox}>{String(rootErr)}</p> : null}
    </div>
  );
}
