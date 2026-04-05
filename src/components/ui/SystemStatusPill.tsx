import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import styles from "./SystemStatusPill.module.css";

type Variant = "pill" | "minimal";

export function SystemStatusPill({
  className = "",
  variant = "pill",
}: {
  className?: string;
  variant?: Variant;
}) {
  const online = useOnlineStatus();
  const isMinimal = variant === "minimal";
  return (
    <span
      className={`${isMinimal ? styles.minimal : styles.pill} ${className}`}
      role="status"
      title={online ? "Conexão ativa" : "Sem conexão"}
    >
      <span className={`${styles.dotWrap} ${isMinimal ? styles.dotWrapMinimal : ""}`} aria-hidden>
        {online && !isMinimal ? <span className={styles.ping} /> : null}
        <span
          className={`${styles.dot} ${online ? styles.dotOnline : styles.dotOffline} ${isMinimal ? styles.dotMinimal : ""}`}
        />
      </span>
      {online ? "Sistema ativo" : "Offline"}
    </span>
  );
}
