import { z } from "zod";
import { isIsoDateYmdFuture } from "@/lib/isoDateYmdFuture";
import type { FormTemplateField } from "@/domain/formTemplate";

const n = z.coerce.number().int().min(0, "Deve ser ≥ 0");
const simNao = z.enum(["sim", "nao"]);

function fieldSchema(field: FormTemplateField): z.ZodTypeAny {
  const label = field.label.trim() || field.fieldKey;

  switch (field.type) {
    case "number":
      return field.required ? n : n.optional();
    case "yes_no":
      return field.required
        ? simNao
        : simNao.optional();
    case "date": {
      const base = z.string();
      const withFuture = base.refine((s) => !s.trim() || !isIsoDateYmdFuture(s), {
        message: "A data não pode ser futura",
      });
      return field.required
        ? withFuture.min(1, `Informe ${label}`)
        : withFuture.optional();
    }
    case "checkbox": {
      const arr = z.array(z.string());
      return field.required
        ? arr.min(1, `Selecione ao menos uma opção em ${label}`)
        : arr.optional();
    }
    case "select": {
      const opts = (field.selectOptions ?? []).filter(Boolean);
      if (opts.length === 0) {
        return field.required
          ? z.string().min(1, `Informe ${label}`)
          : z.string().optional();
      }
      const e = z.enum(opts as [string, ...string[]]);
      return field.required ? e : e.optional();
    }
    case "textarea":
    case "text":
    default:
      return field.required
        ? z.string().min(1, `Informe ${label}`)
        : z.string().optional();
  }
}

/** Schema Zod só das perguntas extras (etapa dinâmica do wizard). */
export function buildExtraFieldsSchema(fields: FormTemplateField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    shape[f.fieldKey] = fieldSchema(f);
  }
  return z.object(shape);
}
