import { z } from "zod";
import { isValidCpfLength, normalizeCpf } from "@/lib/cpf";

export const loginSchema = z.object({
  cpf: z
    .string()
    .transform((s) => normalizeCpf(s))
    .refine((cpf) => isValidCpfLength(cpf), "CPF deve ter 11 dígitos"),
  password: z.string().min(1, "Informe a senha"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
