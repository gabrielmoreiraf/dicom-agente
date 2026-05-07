interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** false = API real via URL ou proxy; true = mock. Omitido = mock se VITE_API_URL vazio. */
  readonly VITE_USE_API_MOCK?: string;
  /** true = carregar perguntas extras do painel no diagnóstico */
  readonly VITE_FORMS_MODULE_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
