import type { ReactNode } from "react";
import { AppDialog } from "@/components/ui/AppDialog";
import styles from "./AppDialog.module.css";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  danger,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <button type="button" className={styles.btnGhost} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? styles.btnDanger : styles.btnPrimary}
            onClick={() => {
              void (async () => {
                try {
                  await Promise.resolve(onConfirm());
                  onOpenChange(false);
                } catch {
                  /* erro tratado no pai */
                }
              })();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    />
  );
}
