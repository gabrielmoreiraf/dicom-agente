import { NavLink } from "react-router-dom";
import { maskCpf } from "@/lib/cpf";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import styles from "./Sidebar.module.css";

export function Sidebar({
  userName,
  cpf,
  onLogout,
}: {
  userName: string;
  cpf: string;
  onLogout: () => void;
}) {
  const online = useOnlineStatus();

  return (
    <aside className={styles.aside}>
      <div className={styles.brand}>
        <div className={styles.brandRow}>
          <img
            src="/logo_itatira_wh.png"
            alt="Prefeitura Municipal de Itatira"
            className={styles.brandLogo}
            width={240}
            height={48}
            decoding="async"
          />
          <p className={styles.brandKicker} title="Secretaria de Agricultura">
            Sec. de Agricultura
          </p>
        </div>
      </div>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.linkActive : ""}`
          }
        >
          Início
        </NavLink>
        <NavLink
          to="/diagnosticos"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.linkActive : ""}`
          }
        >
          Diagnósticos
        </NavLink>
        <NavLink
          to="/sync"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.linkActive : ""}`
          }
        >
          Sincronização
        </NavLink>
      </nav>
      <div className={styles.footer}>
        <div className={styles.statusCard} role="status">
          <div className={styles.statusRow}>
            <span
              className={`${styles.statusIconWrap} ${online ? styles.statusIconWrapOnline : styles.statusIconWrapOffline}`}
            >
              {online && <span className={styles.ping} />}
              <span
                className={`${styles.dot} ${online ? styles.dotOnline : styles.dotOffline}`}
              />
            </span>
            <div className={styles.statusText}>
              <div className={styles.statusLine1}>
                {online ? "Conectado" : "Sem conexão"}
              </div>
              <div className={styles.statusLine2}>
                {online ? "Sync quando enviar" : "Dados locais seguros"}
              </div>
            </div>
          </div>
        </div>
        <p className={styles.userName}>{userName || "—"}</p>
        <p className={styles.userCpf}>{cpf ? maskCpf(cpf) : ""}</p>
        <button type="button" onClick={onLogout} className={styles.btnLogout}>
          Sair
        </button>
      </div>
    </aside>
  );
}
