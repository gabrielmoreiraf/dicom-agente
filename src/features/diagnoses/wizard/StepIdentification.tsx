import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import * as Select from "@radix-ui/react-select";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { useAuth } from "@/features/auth/AuthContext";
import { fetchComunidades } from "@/features/diagnoses/services/comunidades";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";
import f from "@/styles/forms.module.css";
import radixSelect from "@/components/ui/RadixSelect.module.css";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { wizardFieldClass, wizardLabelClass } from "@/features/diagnoses/wizard/wizardFieldClass";
import wc from "./wizardCommon.module.css";

const coletaStartMonth = new Date(2000, 0, 1);
function coletaEndMonth(): Date {
  const y = new Date().getFullYear();
  return new Date(y + 2, 11, 1);
}

export function StepIdentification() {
  const { register, watch, setValue, control } = useFormContext<DiagnosisFormValues>();
  const comunidadeNome = watch("comunidade");
  const { accessToken, loading: authLoading } = useAuth();

  const {
    data: comunidades,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    /** Inclui o token para refetch após login e não reutilizar cache de antes da sessão. */
    queryKey: ["comunidades", accessToken ?? "none"],
    queryFn: fetchComunidades,
    enabled: !authLoading && !!accessToken,
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (!comunidadeNome?.trim()) {
      setValue("distrito", "");
      return;
    }
    const found = comunidades?.find((c) => c.nome === comunidadeNome);
    const d = found?.distrito?.trim();
    setValue("distrito", d ?? "");
  }, [comunidadeNome, comunidades, setValue]);

  const selectDisabled = isLoading || authLoading;

  const placeholderLabel = selectDisabled
    ? "Carregando…"
    : comunidades?.length === 0
      ? "Nenhuma comunidade ativa"
      : "Selecione…";

  return (
    <div className={`${wc.gridMd2}`}>
      <label className={`${wc.spanMd2} ${wc.block}`}>
        <span className={wizardLabelClass}>Comunidade</span>
        {isError ? (
          <div className={wc.errorBox}>
            <p>{error instanceof Error ? error.message : "Não foi possível carregar as comunidades."}</p>
            <button type="button" className={wc.retryBtn} onClick={() => void refetch()}>
              Tentar novamente
            </button>
          </div>
        ) : null}
        <Controller
          name="comunidade"
          control={control}
          render={({ field }) => (
            <Select.Root
              value={field.value ?? ""}
              onValueChange={field.onChange}
              disabled={selectDisabled || isError}
            >
              <Select.Trigger className={radixSelect.trigger} aria-label="Comunidade">
                <Select.Value placeholder={placeholderLabel} />
                <Select.Icon className={radixSelect.triggerIcon}>
                  <KeyboardArrowDown sx={{ fontSize: 22 }} />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className={radixSelect.content}
                  position="popper"
                  sideOffset={6}
                  collisionPadding={12}
                >
                  <Select.Viewport className={radixSelect.viewport}>
                    {comunidades?.map((c) => (
                      <Select.Item key={c.id} value={c.nome} className={radixSelect.item}>
                        <Select.ItemText>{c.nome}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          )}
        />
      </label>
      <label className={wc.block}>
        <span className={wizardLabelClass}>Distrito</span>
        <input {...register("distrito")} className={wizardFieldClass} />
      </label>
      <label className={wc.block}>
        <span className={wizardLabelClass}>Data da coleta</span>
        <Controller
          name="data_coleta"
          control={control}
          render={({ field }) => (
            <DatePickerField
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="dd/mm/aaaa"
              aria-label="Data da coleta"
              triggerClassName={wizardFieldClass}
              startMonth={coletaStartMonth}
              endMonth={coletaEndMonth()}
            />
          )}
        />
      </label>
      <label className={`${wc.spanMd2} ${wc.block}`}>
        <span className={wizardLabelClass}>Pesquisador responsável</span>
        <input {...register("pesquisador")} className={wizardFieldClass} />
      </label>
      <label className={`${wc.spanMd2} ${wc.block}`}>
        <span className={wizardLabelClass}>Observações</span>
        <textarea
          {...register("observacoes")}
          rows={3}
          className={`${wizardFieldClass} ${f.fieldTextarea}`}
        />
      </label>
      <label className={`${wc.spanMd2} ${wc.block}`}>
        <span className={wizardLabelClass}>GPS (opcional)</span>
        <input
          readOnly
          {...register("gps")}
          className={`${wizardFieldClass} ${f.fieldReadonly}`}
          placeholder="Não capturado"
        />
      </label>
    </div>
  );
}
