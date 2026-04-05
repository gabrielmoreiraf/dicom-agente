import { useEffect, useState } from "react";
import { AppDialog } from "@/components/ui/AppDialog";
import appDialogStyles from "@/components/ui/AppDialog.module.css";
import styles from "./DraftSaveDialog.module.css";

type DraftSaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  onConfirm: (title: string) => void | Promise<void>;
};

export function DraftSaveDialog({
  open,
  onOpenChange,
  initialTitle,
  onConfirm,
}: DraftSaveDialogProps) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (open) setTitle(initialTitle);
  }, [open, initialTitle]);

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nome do rascunho"
      description="Escolha um título para reconhecer este registro na lista. Você pode editar depois ao salvar de novo."
      footer={
        <>
          <button type="button" className={appDialogStyles.btnGhost} onClick={() => onOpenChange(false)}>
            Cancelar
          </button>
          <button
            type="button"
            className={appDialogStyles.btnPrimary}
            onClick={() => {
              void (async () => {
                try {
                  await Promise.resolve(onConfirm(title.trim()));
                  onOpenChange(false);
                } catch {
                  /* alert no pai */
                }
              })();
            }}
          >
            Salvar
          </button>
        </>
      }
    >
      <label className={styles.label}>
        <span className={styles.labelText}>Título</span>
        <input
          type="text"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: Comunidade X — coleta"
          autoComplete="off"
          autoFocus
        />
      </label>
    </AppDialog>
  );
}
