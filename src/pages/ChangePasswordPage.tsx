import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { PasswordField } from "@/components/PasswordField";
import { useAuth } from "@/features/auth/AuthContext";
import { changePasswordSchema, type ChangePasswordForm } from "@/schemas/auth";
import styles from "./ChangePasswordPage.module.css";

export function ChangePasswordPage() {
  const { completePasswordChange } = useAuth();
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ChangePasswordForm>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await completePasswordChange({
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      nav("/", { replace: true });
    } catch (e) {
      setError("root", {
        message: e instanceof Error ? e.message : "Não foi possível alterar a senha.",
      });
    }
  });

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.logo}>DC</div>
          <div>
            <h1 className={styles.headerTitle}>Nova senha obrigatória</h1>
            <p className={styles.headerSub}>Primeiro acesso ao aplicativo</p>
          </div>
        </header>

        <form onSubmit={onSubmit} className={styles.form}>
          <p className={styles.intro}>
            Por segurança, você precisa definir uma nova senha antes de continuar. A senha
            provisória fornecida pela prefeitura não deve ser mantida.
          </p>

          <div className={styles.field}>
            <PasswordField label="Nova senha" autoComplete="new-password" {...register("newPassword")} />
            {errors.newPassword && (
              <span className={styles.error}>{errors.newPassword.message}</span>
            )}
          </div>

          <div className={styles.fieldLast}>
            <PasswordField
              label="Confirmar nova senha"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <span className={styles.error}>{errors.confirmPassword.message}</span>
            )}
          </div>

          {errors.root?.message && (
            <p className={styles.alert} role="alert">
              {errors.root.message}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className={styles.submit}>
            {isSubmitting ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
