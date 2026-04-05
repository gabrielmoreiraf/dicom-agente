import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import styles from "./ProtectedRoute.module.css";

/** Rotas do app principal: exige sessão e senha já alterada se obrigatório. */
export function ProtectedRoute() {
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

  if (mustChangePassword) {
    return <Navigate to="/alterar-senha" replace />;
  }

  return <Outlet />;
}
