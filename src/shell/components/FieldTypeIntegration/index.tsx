import { FC } from "react";
import { FormTypes } from "./configs";
import IntegrationFieldProvider from "./IntegrationFieldProvider";
import { IntegrationFieldConfig } from "../../services/types";
import ConfigureIntegration from "./ConfigureIntegration";
import SelectItems from "./SelectItems";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type IntegrationFieldProps<Value> = {
  name: string;
  label: string;
  description?: string;
  formType: FormTypes;
  required?: boolean;
  value?: Value;
  onChange?: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: Value;
  }) => void;
  error?: string | [string, string][] | null;
  isError?: boolean;
  integrationConfig?: IntegrationFieldConfig;
  maxItems?: number | null;
  isLoading?: boolean;
};

const FieldTypeIntegration: FC<IntegrationFieldProps<any>> = ({
  name,
  label,
  description,
  value,
  onChange,
  required,
  error,
  formType = "configure",
  integrationConfig,
  maxItems,
  isLoading = false,
}) => {
  return (
    <IntegrationFieldProvider maxItems={maxItems}>
      <DndProvider backend={HTML5Backend}>
        {formType === "select" ? (
          <SelectItems
            name={name}
            label="Select Remote Items"
            value={value}
            onSelectionChange={onChange}
            integrationConfig={integrationConfig}
            isLoading={isLoading}
          />
        ) : (
          <ConfigureIntegration
            name={name}
            label={label}
            description={description}
            onChange={onChange}
            error={error}
            required={required}
            formType={formType}
            integrationConfig={integrationConfig}
          />
        )}
      </DndProvider>
    </IntegrationFieldProvider>
  );
};

export default FieldTypeIntegration;
