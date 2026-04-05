import { useState } from "react";
import {
  Controller,
  useFormContext,
  type FieldPathByValue,
  type UseControllerReturn,
} from "react-hook-form";
import type { DiagnosisFormValues } from "@/schemas/diagnosis";

/** Caminhos cujo valor no formulário é `number` (int ≥ 0). */
export type DiagnosisNumericPath = FieldPathByValue<DiagnosisFormValues, number>;

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

function toNonNegInt(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function NumericFieldInput({
  field,
  className,
}: {
  field: UseControllerReturn<DiagnosisFormValues, DiagnosisNumericPath>["field"];
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");

  const numVal = toNonNegInt(Number(field.value));
  const displayValue = focused ? text : String(numVal);

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={className}
      name={field.name}
      ref={field.ref}
      value={displayValue}
      onFocus={() => {
        setFocused(true);
        setText(String(numVal));
      }}
      onChange={(e) => {
        const raw = digitsOnly(e.target.value);
        setText(raw);
        if (raw === "") {
          field.onChange(0);
          return;
        }
        const n = parseInt(raw, 10);
        field.onChange(Number.isFinite(n) ? Math.max(0, n) : 0);
      }}
      onBlur={(e) => {
        setFocused(false);
        const raw = digitsOnly(e.target.value);
        const final = raw === "" ? 0 : parseInt(raw, 10);
        field.onChange(Number.isFinite(final) ? Math.max(0, final) : 0);
        field.onBlur();
      }}
    />
  );
}

/** Inteiro ≥ 0 — digitação manual confiável (evita bugs de `input type="number"` com estado vazio). */
export function NumericField({ name, className }: { name: DiagnosisNumericPath; className?: string }) {
  const { control } = useFormContext<DiagnosisFormValues>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => <NumericFieldInput field={field} className={className} />}
    />
  );
}
