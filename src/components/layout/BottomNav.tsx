import Add from "@mui/icons-material/Add";
import FormatListBulletedOutlined from "@mui/icons-material/FormatListBulletedOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import SyncOutlined from "@mui/icons-material/SyncOutlined";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import styles from "./BottomNav.module.css";

export function BottomNav() {
  const { logout } = useAuth();

  return (
    <nav className={styles.nav} aria-label="Navegação inferior">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ""}`}
      >
        <HomeOutlined sx={{ fontSize: 24 }} className={styles.icon} />
        Início
      </NavLink>
      <NavLink
        to="/diagnosticos"
        className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ""}`}
      >
        <FormatListBulletedOutlined sx={{ fontSize: 24 }} className={styles.icon} />
        Lista
      </NavLink>
      <NavLink to="/diagnostico/novo" className={styles.novoWrap}>
        <span className={styles.fab}>
          <Add sx={{ fontSize: 24 }} />
        </span>
        <span className={styles.novoLabel}>Novo</span>
      </NavLink>
      <NavLink
        to="/sync"
        className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ""}`}
      >
        <SyncOutlined sx={{ fontSize: 24 }} className={styles.icon} />
        Sync
      </NavLink>
      <button
        type="button"
        className={styles.logout}
        onClick={() => void logout()}
        aria-label="Sair da conta"
      >
        <LogoutOutlined sx={{ fontSize: 24 }} className={styles.icon} />
        Sair
      </button>
    </nav>
  );
}
