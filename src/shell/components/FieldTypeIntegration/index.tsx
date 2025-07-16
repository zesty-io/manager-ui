import { FC } from "react";
import { FormTypes } from "./configs";
import IntegrationFieldProvider from "./IntegrationFieldProvider";
import {
  IntegrationFieldApiConfig,
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
  value?: Value | null;
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
  value = null,
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
    <IntegrationFieldProvider
      maxItems={maxItems}
      isLoading={isLoading}
      formType={formType}
      defaultValues={{
        value: value,
        display: integrationFieldDisplay,
        config: integrationFieldApiConfig,
      }}
    >
      <DndProvider backend={HTML5Backend}>
        {formType === "select" ? (
          <SelectItems
            name={name}
            label="Select Remote Items"
            onSelectionChange={onChange}
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
            isLoading={isLoading}
          />
        )}
      </DndProvider>
    </IntegrationFieldProvider>
  );
};

export default FieldTypeIntegration;
