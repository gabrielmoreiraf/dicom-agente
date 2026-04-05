import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import styles from "./ChangePasswordRoute.module.css";

/** Só exibe troca de senha quando há sessão e `mustChangePassword`. */
export function ChangePasswordRoute() {
  const { user, loading, mustChangePassword } = useAuth();

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} aria-hidden />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!mustChangePassword) {
    return <Navigate to="/" replace />;
  }

  return <ChangePasswordPage />;
}
