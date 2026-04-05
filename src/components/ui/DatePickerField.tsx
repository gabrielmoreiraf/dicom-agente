import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
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
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return undefined;
  return dt;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
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
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = parseLocalDate(value);
  const display =
    selected != null
      ? format(selected, "dd/MM/yyyy", { locale: ptBR })
      : null;

  const [month, setMonth] = useState<Date>(() => selected ?? new Date());
  useEffect(() => {
    if (open) {
      setMonth(parseLocalDate(value) ?? new Date());
    }
  }, [open, value]);

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
          <span className={`${styles.triggerValue} ${display == null ? styles.placeholder : ""}`}>
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
            endMonth={endMonth}
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
