import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import styles from "./DatePickerField.module.css";

function parseLocalDate(value: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return undefined;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return undefined;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d)
    return undefined;
  return dt;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function startOfLocalMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isLocalDateAfterToday(date: Date): boolean {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return dayStart.getTime() > todayStart.getTime();
}

export type DatePickerFieldProps = {
  value: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  /** Classe do botão (ex.: wizard field) */
  triggerClassName?: string;
  /** Mês inicial na navegação (dropdown de anos/meses) */
  startMonth?: Date;
  endMonth?: Date;
  /** Se false (padrão), dias futuros e meses após o atual ficam indisponíveis. */
  allowFuture?: boolean;
};

export function DatePickerField({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  disabled,
  id,
  "aria-label": ariaLabel,
  triggerClassName,
  startMonth,
  endMonth,
  allowFuture = false,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = parseLocalDate(value);

  const endMonthKey = endMonth == null ? null : endMonth.getTime();
  const effectiveEndMonth = useMemo(() => {
    const cap = startOfLocalMonth(new Date());
    if (allowFuture) {
      return endMonthKey == null ? undefined : new Date(endMonthKey);
    }
    if (endMonthKey == null) return cap;
    const em = new Date(endMonthKey);
    return em.getTime() > cap.getTime() ? cap : em;
  }, [allowFuture, endMonthKey]);
  const display =
    selected != null ? format(selected, "dd/MM/yyyy", { locale: ptBR }) : null;

  const [month, setMonth] = useState<Date>(() => selected ?? new Date());
  useEffect(() => {
    if (!open) return;
    let m = parseLocalDate(value) ?? new Date();
    if (!allowFuture && effectiveEndMonth) {
      const cap = effectiveEndMonth.getTime();
      if (startOfLocalMonth(m).getTime() > cap) {
        m = effectiveEndMonth;
      }
    }
    setMonth(m);
  }, [open, value, allowFuture, effectiveEndMonth]);

  const triggerCls = triggerClassName ?? styles.trigger;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={triggerCls}
          aria-label={ariaLabel}
        >
          <span
            className={`${styles.triggerValue} ${display == null ? styles.placeholder : ""}`}
          >
            {display ?? placeholder}
          </span>
          <span className={styles.triggerIcon} aria-hidden>
            <CalendarMonthOutlined sx={{ fontSize: 22 }} />
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          align="start"
          sideOffset={8}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DayPicker
            mode="single"
            required={false}
            selected={selected}
            month={month}
            onMonthChange={setMonth}
            onSelect={(d) => {
              if (d) {
                onChange(toIsoDate(d));
                setOpen(false);
              }
            }}
            locale={ptBR}
            weekStartsOn={0}
            captionLayout="dropdown"
            startMonth={startMonth}
            endMonth={effectiveEndMonth}
            disabled={allowFuture ? undefined : (d) => isLocalDateAfterToday(d)}
            className={styles.dayPicker}
            navLayout="around"
          />
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.footerBtn}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Limpar
            </button>
            <button
              type="button"
              className={styles.footerBtn}
              onClick={() => {
                onChange(toIsoDate(new Date()));
                setOpen(false);
              }}
            >
              Hoje
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
