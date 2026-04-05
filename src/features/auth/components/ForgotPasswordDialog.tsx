import { AppDialog } from "@/components/ui/AppDialog";
import appDialogStyles from "@/components/ui/AppDialog.module.css";

type ForgotPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Esqueceu a senha?"
      description="Caso esqueça a senha, solicite à Secretaria de Agricultura para gerar uma senha aleatória."
      footer={
        <button type="button" className={appDialogStyles.btnPrimary} onClick={() => onOpenChange(false)}>
          Entendi
        </button>
      }
    />
  );
}
