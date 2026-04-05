import type { Path, UseFormSetError, FieldValues } from "react-hook-form";
import type { ZodError } from "zod";

export function applyZodIssuesToForm<T extends FieldValues>(
  zodError: ZodError,
  setError: UseFormSetError<T>
) {
  for (const issue of zodError.issues) {
    if (issue.path.length === 0) continue;
    const path = issue.path.join(".") as Path<T>;
    setError(path, { type: "manual", message: issue.message });
  }
}
