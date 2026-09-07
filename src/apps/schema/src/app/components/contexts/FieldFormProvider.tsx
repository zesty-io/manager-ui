import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";

import {
  ContentModelField,
  ContentModelFieldDataType,
  ContentModelFieldValue,
  FieldSettings,
  FieldSettingsOptions,
  IntegrationFieldConfig,
  RepeaterSubField,
} from "../../../../../../shell/services/types";
import { getFormConfig } from "../configs";
import { convertLabelValue, getErrorMessage } from "../../utils";
import { MaxLengths } from "../../../../../content-editor/src/app/components/Editor/Editor";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";

export type FieldBody = Omit<
  ContentModelField,
  "ZUID" | "datatypeOptions" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type FormValue =
  | Exclude<ContentModelFieldValue, FieldSettings>
  | RepeaterSubField[];

export type FormData = {
  [key: string]: FormValue;
};

export type Errors = {
  [key: string]: string | [string, string][];
};

type FieldFormContextType = {
  formData: FormData;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
  isUpdateField: boolean;
  allModels?: any[];
  isDefaultValueEnabled: boolean;
  setIsDefaultValueEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  handleFieldDataChange: (args: {
    inputName: string;
    value: FormValue;
  }) => void;
};

const FieldFormContext = createContext<FieldFormContextType | undefined>(
  undefined
);

export const FieldFormProvider = ({
  children,
  type,
  fields,
  fieldData,
}: {
  children: React.ReactNode;
  type: ContentModelFieldDataType;
  fields: ContentModelField[] | RepeaterSubField[];
  fieldData?: ContentModelField;
}) => {
  const { t } = useTranslation();
  const FORM_CONFIG = getFormConfig(t);
  const isUpdateField = !isEmpty(fieldData);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Errors>({});
  const [isDefaultValueEnabled, setIsDefaultValueEnabled] = useState(
    fieldData?.settings?.defaultValue !== null &&
      fieldData?.settings?.defaultValue !== undefined
  );
  const { data: allModels } = useGetContentModelsQuery();

  // Initialize form data (centralized)
  useEffect(() => {
    let formFields: FormData = {};
    let initialErrors: Errors = {};

    if (!FORM_CONFIG[type]) return;

    const flattenedFormConfig = [
      ...FORM_CONFIG[type]?.details,
      ...FORM_CONFIG[type]?.rules,
    ];

    flattenedFormConfig?.forEach((field) => {
      if (isUpdateField && fieldData) {
        if (field.name === "list") {
          formFields.list = fieldData.settings?.list;
        } else if (field.name === "limit") {
          formFields[field.name] = fieldData.settings?.[field.name];
        } else if (field.name === "group_id") {
          formFields[field.name] = fieldData.settings?.[field.name];
        } else if (field.name === "options") {
          const options = Object.entries(
            fieldData.settings?.options ?? {}
          )?.map(([key, value]) => ({ [key]: value }));
          formFields.options = options as any;
        } else if (field.name === "tooltip") {
          formFields["tooltip"] = fieldData.settings?.tooltip || "";
        } else if (field.name === "integrationFieldConfig") {
          formFields["integrationFieldConfig"] =
            fieldData.settings?.integrationFieldConfig;
        } else if (field.name === "defaultValue") {
          formFields["defaultValue"] =
            type === "number"
              ? fieldData.settings?.defaultValue || 0
              : fieldData.settings?.defaultValue ?? null;
        } else if (
          [
            "minCharLimit",
            "maxCharLimit",
            "regexMatchPattern",
            "regexMatchErrorMessage",
            "regexRestrictPattern",
            "regexRestrictErrorMessage",
            "minValue",
            "maxValue",
            "currency",
            "fileExtensions",
            "fileExtensionsErrorMessage",
          ].includes(field.name)
        ) {
          formFields[field.name] =
            (fieldData.settings as any)?.[field.name] ??
            (field.name === "currency" ? "USD" : null);
        } else {
          formFields[field.name] = (fieldData as any)[field.name] as FormValue;
        }
      } else {
        if (field.type === "checkbox") {
          formFields[field.name] = field.name === "list";
        } else if (field.type === "options") {
          formFields[field.name] = [{ "": "" }];
        } else if (field.type === "toggle_options") {
          formFields[field.name] = [{ 0: "No" }, { 1: "Yes" }];
        } else if (field.name === "defaultValue" && type === "number") {
          formFields[field.name] = 0;
        } else if (
          field.type === "config" &&
          field.name === "integrationFieldConfig"
        ) {
          formFields["integrationFieldConfig"] = {
            endpoint: "",
            headers: null,
            type: null,
            keyPaths: null,
          };
        } else if (
          [
            "defaultValue",
            "minCharLimit",
            "maxCharLimit",
            "regexMatchPattern",
            "regexMatchErrorMessage",
            "regexRestrictPattern",
            "regexRestrictErrorMessage",
            "minValue",
            "maxValue",
            "fileExtensions",
            "fileExtensionsErrorMessage",
          ].includes(field.name)
        ) {
          formFields[field.name] = null;
        } else {
          formFields[field.name] = "";
        }
      }

      if (field.validate?.length) {
        initialErrors[field.name] = "";
      }
    });

    if (type === "repeater") {
      formFields = {
        ...formFields,
        list: false, // Repeater fields do not need to get rendered on the multipage table
        subFields: fieldData?.settings?.subFields || ([] as RepeaterSubField[]),
      };
    }

    setFormData(formFields);
    setErrors(initialErrors);
  }, [type, fieldData]);

  /** Error setting */
  useEffect(() => {
    if (!Object.keys(formData ?? {}).length) {
      return;
    }

    const currFieldNames = fields?.map((field) => field.name);
    let newErrorsObj: Errors = {};

    Object.keys(formData).map((inputName) => {
      if (
        inputName === "defaultValue" &&
        isDefaultValueEnabled &&
        (formData.defaultValue === "" || formData.defaultValue === null)
      ) {
        newErrorsObj[inputName] = t("schema.validationRequiredField");
      }

      if (type === "text" || type === "textarea") {
        if (inputName === "minCharLimit" && !isNaN(+formData.minCharLimit)) {
          if ((formData.minCharLimit as number) > MaxLengths[type]) {
            newErrorsObj[inputName] = t(
              "schema.validationCannotExceedMaxChars",
              { maxLength: MaxLengths[type] }
            );
          } else if (formData.minCharLimit > formData.maxCharLimit) {
            newErrorsObj[inputName] = t(
              "schema.validationCannotExceedMaxCharCount"
            );
          }
        }

        if (
          inputName === "maxCharLimit" &&
          !isNaN(+formData.maxCharLimit) &&
          (formData.maxCharLimit as number) > MaxLengths[type]
        ) {
          newErrorsObj[inputName] = t("schema.validationCannotExceedMaxChars", {
            maxLength: MaxLengths[type],
          });
        }

        if (inputName === "regexMatchPattern" && formData.regexMatchPattern) {
          try {
            new RegExp(formData.regexMatchPattern as string);
          } catch (e) {
            newErrorsObj[inputName] = t("schema.validationInvalidRegexPattern");
          }
        }

        if (
          inputName === "regexMatchErrorMessage" &&
          formData.regexMatchPattern !== null &&
          formData.regexMatchErrorMessage === ""
        ) {
          newErrorsObj[inputName] = t("schema.validationRequiredField");
        }

        if (
          inputName === "regexRestrictPattern" &&
          formData.regexRestrictPattern
        ) {
          try {
            new RegExp(formData.regexRestrictPattern as string);
          } catch (e) {
            newErrorsObj[inputName] = t("schema.validationInvalidRegexPattern");
          }
        }

        if (
          inputName === "regexRestrictErrorMessage" &&
          formData.regexRestrictPattern !== null &&
          formData.regexRestrictErrorMessage === ""
        ) {
          newErrorsObj[inputName] = t("schema.validationRequiredField");
        }
      }

      if (inputName === "minValue" && formData.minValue) {
        if (isNaN(+formData.minValue)) {
          newErrorsObj[inputName] = t("schema.validationInvalidNumber");
        } else if (formData.minValue > formData.maxValue) {
          newErrorsObj[inputName] = t("schema.validationCannotExceedMaxValue");
        }
      }

      if (inputName === "maxValue" && formData.maxValue) {
        if (isNaN(+formData.maxValue)) {
          newErrorsObj[inputName] = t("schema.validationInvalidNumber");
        } else if (formData.maxValue < formData.minValue) {
          newErrorsObj[inputName] = t(
            "schema.validationCannotBeLessThanMinValue"
          );
        }
      }

      if (inputName === "currency" && !formData.currency) {
        newErrorsObj[inputName] = t("schema.validationSelectCurrency");
      }

      if (
        inputName === "fileExtensions" &&
        formData.fileExtensions !== null &&
        !(formData.fileExtensions as string[])?.length
      ) {
        newErrorsObj[inputName] = t("schema.validationFieldRequired");
      }

      if (
        inputName === "fileExtensionsErrorMessage" &&
        formData.fileExtensions !== null &&
        formData.fileExtensionsErrorMessage === ""
      ) {
        newErrorsObj[inputName] = t("schema.validationFieldRequired");
      }

      if (inputName === "integrationFieldConfig") {
        const intField =
          formData?.integrationFieldConfig as IntegrationFieldConfig;

        if (!intField?.endpoint || !intField?.type || !intField?.keyPaths) {
          newErrorsObj[inputName] = t("schema.validationIncompleteApiConfig");
        }
      }

      if (
        inputName in errors &&
        ![
          "defaultValue",
          "minCharLimit",
          "maxCharLimit",
          "regexMatchPattern",
          "regexRestrictPattern",
          "regexMatchErrorMessage",
          "regexRestrictErrorMessage",
          "minValue",
          "maxValue",
          "currency",
          "fileExtensions",
          "fileExtensionsErrorMessage",
          "integrationFieldConfig",
        ].includes(inputName)
      ) {
        const { maxLength, label, validate } = FORM_CONFIG[type].details.find(
          (field) => field.name === inputName
        );

        // Special validation for "name"
        if (inputName === "name") {
          newErrorsObj.name = getErrorMessage({
            value: formData.name as string,
            fieldNames: currFieldNames,
            maxLength,
            label,
            validate,
          });

          // When updating a field, user can choose to just leave the reference name the same
          if (isUpdateField && formData.name === fieldData.name) {
            newErrorsObj.name = "";
          }
        } else if (inputName === "options") {
          newErrorsObj.options = getErrorMessage({
            value: formData.options as FieldSettingsOptions[],
            maxLength,
            validate,
          });
        } else {
          // All other input validation
          newErrorsObj[inputName] = getErrorMessage({
            value: formData[inputName] as string,
            maxLength,
            label,
            validate,
          });
        }
      }
    });

    setErrors(newErrorsObj);
  }, [formData, isDefaultValueEnabled]);

  const handleFieldDataChange = useCallback(
    ({ inputName, value }: { inputName: string; value: FormValue }) => {
      const modelName =
        inputName === "relatedModelZUID" && !!value
          ? allModels?.find((model) => model.ZUID === value)?.label
          : "";

      setFormData((prevData: any) => ({
        ...prevData,
        [inputName]:
          inputName === "name" ? convertLabelValue(value as string) : value,

        // Auto populate "name" when "label" field changes
        ...(inputName === "label" &&
          !isUpdateField && {
            name: convertLabelValue(value as string),
          }),

        // Reset relatedFieldZUID when model zuid changes
        ...(inputName === "relatedModelZUID" && {
          relatedFieldZUID: "",
        }),

        // Auto populate "name" and "label" when relatedModelZUID changes
        ...(inputName === "relatedModelZUID" &&
          !isUpdateField && {
            name: convertLabelValue(modelName as string),
            label: modelName as any,
          }),
      }));
    },
    [allModels, isUpdateField]
  );

  return (
    <FieldFormContext.Provider
      value={{
        formData,
        errors,
        setErrors,
        isUpdateField,
        allModels,
        isDefaultValueEnabled,
        setIsDefaultValueEnabled,
        handleFieldDataChange,
      }}
    >
      {children}
    </FieldFormContext.Provider>
  );
};

export const useFieldForm = () => {
  const context = useContext(FieldFormContext);

  if (!context) {
    throw new Error("useFieldForm must be used within a FieldFormProvider");
  }

  return context;
};
