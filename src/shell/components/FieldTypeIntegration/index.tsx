import { FC } from "react";
import { FormTypes } from "./configs";
import IntegrationFieldProvider from "./IntegrationFieldProvider";
import {
  IntegrationFieldApiConfig,
  IntegrationFieldConfig,
  IntegrationFieldDisplay,
} from "../../services/types";
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
  integrationFieldApiConfig?: IntegrationFieldApiConfig | null;
  integrationFieldDisplay?: IntegrationFieldDisplay | null;
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
  maxItems,
  isLoading = false,
  integrationFieldApiConfig = null,
  integrationFieldDisplay = null,
}) => {
  return (
    <IntegrationFieldProvider maxItems={maxItems} isLoading={isLoading}>
      <DndProvider backend={HTML5Backend}>
        {formType === "select" ? (
          <SelectItems
            name={name}
            label="Select Remote Items"
            value={value}
            onSelectionChange={onChange}
            isLoading={isLoading}
            integrationFieldApiConfig={integrationFieldApiConfig}
            integrationFieldDisplay={integrationFieldDisplay}
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
            isLoading={isLoading}
            integrationFieldApiConfig={integrationFieldApiConfig}
            integrationFieldDisplay={integrationFieldDisplay}
          />
        )}
      </DndProvider>
    </IntegrationFieldProvider>
  );
};

export default FieldTypeIntegration;
