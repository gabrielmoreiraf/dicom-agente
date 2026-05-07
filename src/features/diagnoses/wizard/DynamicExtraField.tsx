import { Controller, useFormContext } from "react-hook-form";
import { DatePickerField } from "@/components/ui/DatePickerField";
import type { FormTemplateField } from "@/domain/formTemplate";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import { wizardFieldClass as field } from "@/features/diagnoses/wizard/wizardFieldClass";
import wc from "./wizardCommon.module.css";

type Props = {
  def: FormTemplateField;
};

export function DynamicExtraField({ def }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DiagnosisFormValues>();

  const err = (errors as Record<string, { message?: string } | undefined>)[def.fieldKey];

  switch (def.type) {
    case "number":
      return (
        <label className={wc.block}>
          <span className={wc.labelSm}>{def.label}</span>
          <Controller
            name={def.fieldKey}
            control={control}
            render={({ field: f }) => (
              <input
                type="text"
                inputMode="numeric"
                className={field}
                value={String(f.value ?? 0)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  f.onChange(raw === "" ? 0 : Math.max(0, parseInt(raw, 10) || 0));
                }}
                onBlur={f.onBlur}
              />
            )}
          />
          {err?.message ? <p className={wc.errorBox}>{err.message}</p> : null}
        </label>
      );

    case "yes_no":
      return (
        <div className={wc.block}>
          <span className={wc.labelSm}>{def.label}</span>
          <div className={wc.radioRow}>
            {(["sim", "nao"] as const).map((v) => (
              <label key={v} className={wc.radioLabel}>
                <input type="radio" value={v} {...register(def.fieldKey)} />
                <span className={wc.radioText}>{v === "sim" ? "Sim" : "Não"}</span>
              </label>
            ))}
          </div>
          {err?.message ? <p className={wc.errorBox}>{err.message}</p> : null}
        </div>
      );

    case "date":
      return (
        <label className={wc.block}>
          <span className={wc.labelSm}>{def.label}</span>
          <Controller
            name={def.fieldKey}
            control={control}
            render={({ field: f }) => (
              <DatePickerField
                value={typeof f.value === "string" ? f.value : ""}
                onChange={f.onChange}
                triggerClassName={field}
                aria-label={def.label}
              />
            )}
          />
          {err?.message ? <p className={wc.errorBox}>{err.message}</p> : null}
        </label>
      );

    case "select":
      return (
        <label className={wc.block}>
          <span className={wc.labelSm}>{def.label}</span>
          <select className={field} {...register(def.fieldKey)}>
            <option value="">Selecione…</option>
            {(def.selectOptions ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {err?.message ? <p className={wc.errorBox}>{err.message}</p> : null}
        </label>
      );

    case "checkbox":
      return (
        <fieldset className={wc.block}>
          <legend className={wc.labelSm}>{def.label}</legend>
          <Controller
            name={def.fieldKey}
            control={control}
            render={({ field: f }) => {
              const selected = Array.isArray(f.value) ? (f.value as string[]) : [];
              return (
                <div className={wc.stack4}>
                  {(def.selectOptions ?? []).map((o) => (
                    <label key={o} className={wc.radioLabel}>
                      <input
                        type="checkbox"
                        checked={selected.includes(o)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            f.onChange([...selected, o]);
                          } else {
                            f.onChange(selected.filter((x) => x !== o));
                          }
                        }}
                      />
                      <span className={wc.radioText}>{o}</span>
                    </label>
                  ))}
                </div>
              );
            }}
          />
          {err?.message ? <p className={wc.errorBox}>{err.message}</p> : null}
        </fieldset>
      );

    case "textarea":
      return (
        <label className={wc.block}>
          <span className={wc.labelSm}>{def.label}</span>
          <textarea rows={3} className={field} {...register(def.fieldKey)} />
          {err?.message ? <p className={wc.errorBox}>{err.message}</p> : null}
        </label>
      );

    case "text":
    default:
      return (
        <label className={wc.block}>
          <span className={wc.labelSm}>{def.label}</span>
          <input type="text" className={field} {...register(def.fieldKey)} />
          {err?.message ? <p className={wc.errorBox}>{err.message}</p> : null}
        </label>
      );
  }
}
