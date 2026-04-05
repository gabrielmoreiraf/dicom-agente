import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import * as Select from "@radix-ui/react-select";
import EditOutlined from "@mui/icons-material/EditOutlined";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import { db } from "@/db";
import { useAuth } from "@/features/auth/AuthContext";
import {
  COMUNIDADES_CATALOG_META_ID,
  fetchComunidades,
  formatComunidadesCatalogLabel,
  refreshComunidadesCatalog,
} from "@/features/diagnoses/services/comunidades";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
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
  const pesquisador = watch("pesquisador") ?? "";
  const { accessToken, loading: authLoading, user } = useAuth();
  const qc = useQueryClient();
  const online = useOnlineStatus();
  const sessionName = user?.name?.trim() ?? "";
  const namesMatch = sessionName !== "" && pesquisador.trim() === sessionName;
  const showPesquisadorEdit =
    sessionName !== "" && pesquisador.trim() !== "" && pesquisador.trim() !== sessionName;
  const [pesquisadorEditing, setPesquisadorEditing] = useState(false);
  const [catalogRefreshing, setCatalogRefreshing] = useState(false);

  const catalogMetaRow = useLiveQuery(
    () => db.catalog_meta.get(COMUNIDADES_CATALOG_META_ID),
    [],
  );

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

  useEffect(() => {
    if (namesMatch) setPesquisadorEditing(false);
  }, [namesMatch]);

  const selectDisabled = isLoading || authLoading;

  const placeholderLabel = selectDisabled
    ? "Carregando…"
    : comunidades?.length === 0
      ? "Nenhuma comunidade ativa"
      : "Selecione…";

  const onRefreshCatalog = async () => {
    if (!online || !accessToken || catalogRefreshing) return;
    setCatalogRefreshing(true);
    try {
      const r = await refreshComunidadesCatalog();
      if (!r.ok && r.reason === "error") {
        window.alert(r.message ?? "Não foi possível atualizar o catálogo.");
      }
      await qc.invalidateQueries({ queryKey: ["comunidades"] });
    } finally {
      setCatalogRefreshing(false);
    }
  };

  return (
    <div className={`${wc.gridMd2}`}>
      <label className={`${wc.spanMd2} ${wc.block}`}>
        <span className={wizardLabelClass}>Comunidade</span>
        <div className={wc.catalogToolbar}>
          <p className={wc.catalogMeta}>
            {formatComunidadesCatalogLabel(catalogMetaRow?.catalog_fetched_at ?? null)}
          </p>
          {online && accessToken && !authLoading ? (
            <button
              type="button"
              className={wc.catalogRefreshBtn}
              disabled={catalogRefreshing || isLoading}
              onClick={() => void onRefreshCatalog()}
            >
              {catalogRefreshing ? "Atualizando…" : "Atualizar comunidades"}
            </button>
          ) : null}
        </div>
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
      <div className={`${wc.spanMd2} ${wc.block}`}>
        <span className={wizardLabelClass}>Pesquisador responsável</span>
        {pesquisadorEditing ? (
          <Controller
            name="pesquisador"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                autoFocus
                className={wizardFieldClass}
                aria-label="Editar pesquisador responsável"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  field.onChange(v);
                  field.onBlur();
                  setPesquisadorEditing(false);
                }}
              />
            )}
          />
        ) : (
          <div className={wc.pesquisadorShell}>
            <span className={wc.pesquisadorIconWrap} aria-hidden>
              <PersonOutlined sx={{ fontSize: 22 }} />
            </span>
            <div className={wc.pesquisadorRow}>
              <span className={wc.pesquisadorValue}>
                {pesquisador.trim() || sessionName || "—"}
              </span>
              {showPesquisadorEdit ? (
                <button
                  type="button"
                  className={wc.pesquisadorEditBtn}
                  aria-label="Editar pesquisador responsável"
                  onClick={() => setPesquisadorEditing(true)}
                >
                  <EditOutlined sx={{ fontSize: 20 }} />
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
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
