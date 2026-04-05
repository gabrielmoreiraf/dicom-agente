import { AppDialog } from "@/components/ui/AppDialog";
import appDialogStyles from "@/components/ui/AppDialog.module.css";

export function DraftsInfoDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rascunhos"
      description={
        <>
          Os rascunhos ficam salvos só neste aparelho. Na última etapa do formulário, use{" "}
          <strong>Salvar rascunho</strong> para definir um nome e guardar localmente. Sem internet, use
          essa opção e sincronize depois em <strong>Sincronização</strong> quando a rede voltar.
        </>
      }
      footer={
        <button type="button" className={appDialogStyles.btnPrimary} onClick={() => onOpenChange(false)}>
          Entendi
        </button>
      }
    />
  );
}
