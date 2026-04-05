import SyncOutlined from "@mui/icons-material/SyncOutlined";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { AutoSyncBridge } from "@/features/diagnoses/AutoSyncBridge";
import { HomeIntro } from "@/components/home/HomeIntro";
import { SystemStatusPill } from "@/components/ui/SystemStatusPill";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  const { logout, user } = useAuth();
  const isHome = useMatch({ path: "/", end: true });

  return (
    <div className={styles.root}>
      <Sidebar
        userName={user?.name ?? ""}
        cpf={user?.cpf ?? ""}
        onLogout={() => void logout()}
      />
      <div className={styles.mainCol}>
        <header className={styles.header}>
          <div className={styles.headerTopBar}>
            <SystemStatusPill variant="minimal" />
            <Link
              to="/sync"
              className={styles.syncLink}
              aria-label="Sincronização"
            >
              <SyncOutlined sx={{ fontSize: 18 }} />
            </Link>
          </div>
          <div className={styles.headerBranding}>
            <div className={styles.headerLogoRow}>
              <img
                src="/dicom_2.png"
                alt="DICOM — Diagnóstico de Comunidades"
                className={styles.headerLogo}
                decoding="async"
              />
            </div>
            {isHome && (
              <div className={styles.headerPageIntro}>
                <HomeIntro />
              </div>
            )}
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
