import { Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { AutoSyncBridge } from "@/features/diagnoses/AutoSyncBridge";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className={styles.root}>
      <Sidebar
        userName={user?.name ?? ""}
        cpf={user?.cpf ?? ""}
        onLogout={() => void logout()}
      />
      <div className={styles.mainCol}>
        <header className={styles.header}>
          <div className={styles.headerBranding}>
            <div className={styles.headerLogoRow}>
              <div className={styles.headerLogoSlot}>
                <img
                  src="/dicom_2.png"
                  alt="DICOM — Diagnóstico de Comunidades"
                  className={styles.headerLogo}
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </header>
        <main className={styles.content}>
          <AutoSyncBridge />
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
