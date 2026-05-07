import { StepAgricultura } from "./StepAgricultura";
import { StepAssinatura } from "./StepAssinatura";
import { StepAssociacao } from "./StepAssociacao";
import { StepCasas } from "./StepCasas";
import { StepEmpregabilidade } from "./StepEmpregabilidade";
import { StepExtras } from "./StepExtras";
import { StepFamilies } from "./StepFamilies";
import { StepHidrico } from "./StepHidrico";
import { StepIdentification } from "./StepIdentification";
import { StepPecuaria } from "./StepPecuaria";
import type { FormTemplateField } from "@/domain/formTemplate";
import { getWizardRouterStep } from "@/features/forms/wizardLayout";
import type { WizardLayout } from "@/features/forms/wizardLayout";

type Props = {
  uiStep: number;
  layout: WizardLayout;
  extraFields: FormTemplateField[];
};

export function WizardStepRouter({ uiStep, layout, extraFields }: Props) {
  const routed = getWizardRouterStep(uiStep, layout);

  if (routed === "extras") {
    return <StepExtras fields={extraFields} />;
  }

  switch (routed) {
    case 1:
      return <StepIdentification />;
    case 2:
      return <StepFamilies />;
    case 3:
      return <StepCasas />;
    case 4:
      return <StepHidrico />;
    case 5:
      return <StepEmpregabilidade />;
    case 6:
      return <StepPecuaria />;
    case 7:
      return <StepAgricultura />;
    case 8:
      return <StepAssociacao />;
    case 9:
      return <StepAssinatura />;
    default:
      return null;
  }
}
