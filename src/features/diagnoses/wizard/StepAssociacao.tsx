import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { RadioSimNao } from "@/features/diagnoses/wizard/RadioSimNao";
import { wizardFieldClass as fieldClass } from "@/features/diagnoses/wizard/wizardFieldClass";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import wc from "./wizardCommon.module.css";

const birthStartMonth = new Date(1920, 0, 1);
function birthEndMonth(): Date {
  return new Date(new Date().getFullYear(), 11, 1);
}

const assocStartMonth = new Date(1950, 0, 1);

function PersonBlock({
  title,
  nome,
  tel,
  nasc,
}: {
  title: string;
  nome: keyof DiagnosisFormValues;
  tel: keyof DiagnosisFormValues;
  nasc: keyof DiagnosisFormValues;
}) {
  const { register, control } = useFormContext<DiagnosisFormValues>();
  return (
    <div className={wc.personBlock}>
      <h4 className={wc.personTitle}>{title}</h4>
      <div className={wc.gridSm3}>
        <label className={`${wc.block} ${wc.spanSm2}`}>
          <span className={wc.labelXs}>Nome</span>
          <input {...register(nome)} className={fieldClass} />
        </label>
        <label className={wc.block}>
          <span className={wc.labelXs}>Telefone</span>
          <input type="tel" {...register(tel)} className={fieldClass} />
        </label>
        <label className={wc.block}>
          <span className={wc.labelXs}>Nascimento</span>
          <Controller
            name={nasc}
            control={control}
            render={({ field }) => (
              <DatePickerField
                value={typeof field.value === "string" ? field.value : ""}
                onChange={field.onChange}
                placeholder="dd/mm/aaaa"
                aria-label={`Data de nascimento — ${title}`}
                triggerClassName={fieldClass}
                startMonth={birthStartMonth}
                endMonth={birthEndMonth()}
              />
            )}
          />
        </label>
      </div>
    </div>
  );
}

export function StepAssociacao() {
  const { register, control } = useFormContext<DiagnosisFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "fiscal" });

  return (
    <div className={wc.spaceY6}>
      <div className={wc.gridMd2}>
        <label className={`${wc.spanMd2} ${wc.block}`}>
          <span className={wc.labelMd}>Nome da associação</span>
          <input {...register("assoc_nome")} className={fieldClass} />
        </label>
        <label className={wc.block}>
          <span className={wc.labelMd}>CNPJ</span>
          <input {...register("assoc_cnpj")} className={fieldClass} placeholder="00.000.000/0000-00" />
        </label>
        <div className={wc.block}>
          <span className={wc.labelMd}>Tem sede própria?</span>
          <RadioSimNao name="assoc_sede_propria" />
        </div>
        <label className={wc.block}>
          <span className={wc.labelMd}>Data de fundação</span>
          <Controller
            name="assoc_fundacao"
            control={control}
            render={({ field }) => (
              <DatePickerField
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="dd/mm/aaaa"
                aria-label="Data de fundação"
                triggerClassName={fieldClass}
                startMonth={assocStartMonth}
                endMonth={birthEndMonth()}
              />
            )}
          />
        </label>
        <label className={wc.block}>
          <span className={wc.labelMd}>Data da diretoria atual</span>
          <Controller
            name="assoc_diretoria"
            control={control}
            render={({ field }) => (
              <DatePickerField
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="dd/mm/aaaa"
                aria-label="Data da diretoria atual"
                triggerClassName={fieldClass}
                startMonth={assocStartMonth}
                endMonth={birthEndMonth()}
              />
            )}
          />
        </label>
      </div>

      <h3 className={wc.assocHeading}>Diretoria</h3>
      <div className={wc.gridMd2}>
        <PersonBlock title="Presidente" nome="dir_p_nome" tel="dir_p_tel" nasc="dir_p_nasc" />
        <PersonBlock title="Vice-presidente" nome="dir_vp_nome" tel="dir_vp_tel" nasc="dir_vp_nasc" />
        <PersonBlock title="Tesoureiro" nome="dir_t_nome" tel="dir_t_tel" nasc="dir_t_nasc" />
        <PersonBlock title="2º Tesoureiro" nome="dir_t2_nome" tel="dir_t2_tel" nasc="dir_t2_nasc" />
        <PersonBlock title="Secretário" nome="dir_s_nome" tel="dir_s_tel" nasc="dir_s_nasc" />
        <PersonBlock title="2º Secretário" nome="dir_s2_nome" tel="dir_s2_tel" nasc="dir_s2_nasc" />
      </div>

      <div className={wc.whiteCard}>
        <div className={wc.fiscalHeader}>
          <h3 className={wc.fiscalTitle}>Conselho fiscal</h3>
          <button
            type="button"
            onClick={() => append({ nome: "", telefone: "", nasc: "" })}
            className={wc.addMemberBtn}
          >
            + Membro
          </button>
        </div>
        <div className={wc.spaceY4}>
          {fields.map((f, i) => (
            <div key={f.id} className={wc.fiscalCard}>
              <button
                type="button"
                onClick={() => remove(i)}
                className={wc.removeBtn}
                aria-label="Remover"
              >
                ×
              </button>
              <div className={wc.gridSm3}>
                <label className={`${wc.block} ${wc.spanSm2}`}>
                  <span className={wc.labelXs}>Nome</span>
                  <input {...register(`fiscal.${i}.nome` as const)} className={fieldClass} />
                </label>
                <label className={wc.block}>
                  <span className={wc.labelXs}>Telefone</span>
                  <input type="tel" {...register(`fiscal.${i}.telefone` as const)} className={fieldClass} />
                </label>
                <label className={wc.block}>
                  <span className={wc.labelXs}>Nascimento</span>
                  <Controller
                    name={`fiscal.${i}.nasc`}
                    control={control}
                    render={({ field }) => (
                      <DatePickerField
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="dd/mm/aaaa"
                        aria-label={`Nascimento — membro ${i + 1}`}
                        triggerClassName={fieldClass}
                        startMonth={birthStartMonth}
                        endMonth={birthEndMonth()}
                      />
                    )}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
