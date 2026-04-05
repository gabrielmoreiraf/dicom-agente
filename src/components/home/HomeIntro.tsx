import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import styles from "./HomeIntro.module.css";

export function HomeIntro() {
  const online = useOnlineStatus();

  return (
    <>
      <h1 className={styles.title}>Início</h1>
      <p className={styles.text}>
        {online
          ? "Conectado — diagnósticos pendentes são enviados automaticamente."
          : "Offline — dados seguros no aparelho; ao voltar a rede, a sincronização roda."}
      </p>
    </>
  );
}
