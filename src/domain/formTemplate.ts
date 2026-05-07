/** Definição de campo vinda do painel (`GET /formularios/campo/diagnostico`). */
export type FormTemplateFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "yes_no"
  | "date";

export type FormTemplateField = {
  id: string;
  fieldKey: string;
  label: string;
  type: FormTemplateFieldType;
  sortOrder: number;
  required: boolean;
  selectOptions: string[] | null;
};

export type FormTemplateCampo = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  fields: FormTemplateField[];
  updatedAt: string;
};

export type FormTemplateCacheMeta = {
  id: "diagnosis_form_template";
  fetched_at: string | null;
  template_json: string | null;
};
