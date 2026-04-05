import { StepAgricultura } from "./StepAgricultura";
import { StepAssinatura } from "./StepAssinatura";
import { StepAssociacao } from "./StepAssociacao";
import { StepCasas } from "./StepCasas";
import { StepFamilies } from "./StepFamilies";
import { StepHidrico } from "./StepHidrico";
import { StepIdentification } from "./StepIdentification";
import { StepPecuaria } from "./StepPecuaria";

export function WizardStepRouter({ step }: { step: number }) {
  switch (step) {
    case 1:
      return <StepIdentification />;
    case 2:
      return <StepFamilies />;
    case 3:
      return <StepCasas />;
    case 4:
      return <StepHidrico />;
    case 5:
      return <StepPecuaria />;
    case 6:
      return <StepAgricultura />;
    case 7:
      return <StepAssociacao />;
    case 8:
      return <StepAssinatura />;
    default:
      return null;
  }
}
