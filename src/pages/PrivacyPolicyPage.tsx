import { Link } from "react-router-dom";
import styles from "./PrivacyPolicyPage.module.css";

export function PrivacyPolicyPage() {
  return (
    <div className={styles.root}>
      <article className={styles.article}>
        <p className={styles.note}>
          <strong>Nota:</strong> texto-base para revisão pelo município / DPO antes da divulgação
          oficial.
        </p>
        <h1 className={styles.title}>Privacidade e dados no aplicativo de campo</h1>
        <p className={styles.text}>
          Este aplicativo armazena sessão e rascunhos de diagnóstico no seu dispositivo (IndexedDB)
          para funcionar offline. Dados sensíveis incluem CPF de login e assinatura digital nas
          fichas — trate o aparelho com cuidado e use limpeza local quando o dispositivo for
          descontinuado ou repassado.
        </p>
        <h2 className={styles.h2}>Finalidade</h2>
        <p className={styles.text}>
          Coleta e sincronização de diagnósticos de comunidades para políticas públicas municipais,
          com gestão de acesso por CPF e senha.
        </p>
        <h2 className={styles.h2}>Direitos</h2>
        <p className={styles.text}>
          Solicite ao órgão municipal o exercício dos direitos previstos na LGPD (acesso, correção,
          portabilidade, eliminação quando aplicável), pelos canais oficiais.
        </p>
        <p className={styles.back}>
          <Link to="/login" className={styles.backLink}>
            ← Voltar ao login
          </Link>
        </p>
      </article>
    </div>
  );
}
