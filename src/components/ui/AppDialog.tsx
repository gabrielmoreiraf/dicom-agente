import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import styles from "./AppDialog.module.css";

type AppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Texto só para leitores de tela quando não há `description` visível. */
  ariaDescription?: string;
};

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  ariaDescription,
}: AppDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className={styles.description}>{description}</Dialog.Description>
          ) : (
            <Dialog.Description className={styles.visuallyHidden}>
              {ariaDescription ?? title}
            </Dialog.Description>
          )}
          {children ? <div className={styles.body}>{children}</div> : null}
          {footer ? <div className={styles.footer}>{footer}</div> : null}
          <Dialog.Close className={styles.close} type="button" aria-label="Fechar">
            ×
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
