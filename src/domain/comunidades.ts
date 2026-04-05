export interface ComunidadeItem {
  id: string;
  nome: string;
  /** Distrito cadastrado na prefeitura — preenchimento automático no formulário. */
  distrito?: string | null;
}
