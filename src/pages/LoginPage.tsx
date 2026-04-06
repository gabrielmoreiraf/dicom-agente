import { useState } from "react";
import Login from "@mui/icons-material/Login";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { ForgotPasswordDialog } from "@/features/auth/components/ForgotPasswordDialog";
import { PasswordField } from "@/components/PasswordField";
import { maskCpf } from "@/lib/cpf";
import { loginSchema, type LoginForm } from "@/schemas/auth";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const { user, loading, mustChangePassword, login } = useAuth();
  const nav = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { cpf: "", password: "" },
  });

  if (!loading && user) {
    if (mustChangePassword) {
      return <Navigate to="/alterar-senha" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const onSubmit = handleSubmit(async (data) => {
    setLoginError(null);
    try {
      await login(data.cpf, data.password);
      nav("/", { replace: true });
    } catch (e) {
      setLoginError(
        e instanceof Error ? e.message : "Não foi possível entrar.",
      );
    }
  });

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.center}>
          <header className={styles.header}>
            <img
              src="/dicom_1.png"
              alt="DICOM — Diagnóstico de Comunidades"
              className={styles.brandLogo}
            />
          </header>

          <form onSubmit={onSubmit} className={styles.form}>
            <label className={styles.label}>
              <span className={styles.labelText}>CPF</span>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    placeholder="000.000.000-00"
                    className={styles.input}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value}
                    onChange={(e) => field.onChange(maskCpf(e.target.value))}
                  />
                )}
              />
              {errors.cpf && (
                <span className={styles.error}>{errors.cpf.message}</span>
              )}
            </label>

            <div>
              <PasswordField
                label="Senha"
                autoComplete="current-password"
                variant="stitch"
                className={styles.passwordOverrides}
                {...register("password")}
              />
              {errors.password && (
                <span className={styles.error}>{errors.password.message}</span>
              )}
            </div>

            <div className={styles.forgotRow}>
              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => setForgotPasswordOpen(true)}
              >
                Esqueceu a senha?
              </button>
            </div>

            {loginError && (
              <p className={styles.alert} role="alert">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submit}
            >
              {isSubmitting ? (
                "Entrando…"
              ) : (
                <>
                  Entrar no Sistema
                  <Login sx={{ fontSize: 20 }} className={styles.icon} />
                </>
              )}
            </button>
          </form>

          <p className={styles.note}>
            Acesso permitido somente com autorização da Secretaria de Agricultura.
          </p>
        </div>

        <footer className={styles.footer}>
          <img
            src="/logo_itatira.png"
            alt="Governo Municipal de Itatira"
            className={styles.logo}
          />
        </footer>
      </div>

      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </div>
  );
}
