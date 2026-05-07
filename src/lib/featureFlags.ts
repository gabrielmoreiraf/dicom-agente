/**
 * Sincronizar com o painel: perguntas extras via API de formulários.
 * Desligado por padrão — VITE_FORMS_MODULE_ENABLED=true no agente e no prefeitura-app.
 */
export function isFormsModuleEnabled(): boolean {
  return import.meta.env.VITE_FORMS_MODULE_ENABLED === "true";
}
