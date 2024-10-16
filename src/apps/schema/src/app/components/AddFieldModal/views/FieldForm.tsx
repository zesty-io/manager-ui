import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { useDispatch } from "react-redux";
import {
  Typography,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Box,
  Tabs,
  Tab,
  Button,
  Grid,
  Stack,
  ListItem,
  FilledInputProps,
  InputProps,
  OutlinedInputProps,
  InputAdornment,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { isEmpty } from "lodash";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";

import { FieldIcon } from "../../Field/FieldIcon";
import {
  FieldFormInput,
  DropdownOptions,
  AutocompleteConfig,
} from "../FieldFormInput";
import { useMediaRules } from "../../hooks/useMediaRules";
import { MediaRules } from "../MediaRules";
import {
  getCategory,
  convertLabelValue,
  getErrorMessage,
} from "../../../utils";
import {
  useCreateContentModelFieldMutation,
  useUpdateContentModelFieldMutation,
  useBulkUpdateContentModelFieldMutation,
  useGetContentModelsQuery,
  useGetContentModelFieldsQuery,
  useDeleteContentModelFieldMutation,
  useUndeleteContentModelFieldMutation,
} from "../../../../../../../shell/services/instance";
import {
  ContentModelField,
  FieldSettings,
  ContentModelFieldValue,
  FieldSettingsOptions,
  ContentModelFieldDataType,
} from "../../../../../../../shell/services/types";
import {
  FIELD_COPY_CONFIG,
  TYPE_TEXT,
  FORM_CONFIG,
  FieldType,
} from "../../configs";
import { ComingSoon } from "../ComingSoon";
import { Learn } from "../Learn";
import { notify } from "../../../../../../../shell/store/notifications";
import { DefaultValue } from "../DefaultValue";
import { CharacterLimit } from "../CharacterLimit";
import { Rules } from "./Rules";
import { MaxLengths } from "../../../../../../content-editor/src/app/components/Editor/Editor";
import {
  Currency,
  currencies,
} from "../../../../../../../shell/components/FieldTypeCurrency/currencies";
import getFlagEmoji from "../../../../../../../utility/getFlagEmoji";

type ActiveTab = "details" | "rules" | "learn";
type Params = {
  id: string;
};
export type FormValue = Exclude<ContentModelFieldValue, FieldSettings>;
export interface FormData {
  [key: string]: FormValue;
}
export interface Errors {
  [key: string]: string | [string, string][];
}
interface Props {
  type: ContentModelFieldDataType;
  name: string;
  onModalClose: () => void;
  onBackClick?: () => void;
  fields: ContentModelField[];
  fieldData?: ContentModelField;
  sortIndex?: number | null;
  onCreateAnotherField?: () => void;
}
export const FieldForm = ({
  type,
  name,
  onModalClose,
  onBackClick,
  fields,
  fieldData,
  sortIndex,
  onCreateAnotherField,
}: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const [fieldStateOnSaveAction, setFieldStateOnSaveAction] = useState<
    "deactivate" | "reactivate"
  >(fieldData?.deletedAt ? "reactivate" : "reactivate");
  const [isAddAnotherFieldClicked, setIsAddAnotherFieldClicked] =
    useState(false);
  const { mediaFoldersOptions } = useMediaRules();

  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<FormData>({});
  const params = useParams<Params>();
  const { id } = params;
  const [
    createContentModelField,
    {
      isLoading: isCreatingField,
      isSuccess: isFieldCreated,
      error: fieldCreationError,
    },
  ] = useCreateContentModelFieldMutation();
  const [
    updateContentModelField,
    {
      isLoading: isUpdatingField,
      isSuccess: isFieldUpdated,
      error: fieldUpdateError,
    },
  ] = useUpdateContentModelFieldMutation();
  const [
    bulkUpdateContentModelField,
    { isLoading: isBulkUpdating, isSuccess: isBulkUpdated },
  ] = useBulkUpdateContentModelFieldMutation();
  const { data: allModels, isLoading: isLoadingModels } =
    useGetContentModelsQuery();
  const {
    data: selectedModelFields,
    isFetching: isFetchingSelectedModelFields,
  } = useGetContentModelFieldsQuery(formData.relatedModelZUID as string, {
    skip: !formData.relatedModelZUID,
  });

  const isUpdateField = !isEmpty(fieldData);
  const isInbetweenField = sortIndex !== null;
  const modelsOptions: DropdownOptions[] = useMemo(() => {
    return allModels
      ?.map((model) => {
        return {
          label: model.label,
          value: model.ZUID,
        };
      })
      ?.sort((a, b) => a.label.localeCompare(b.label));
  }, [allModels]);
  const fieldsOptions: DropdownOptions[] = useMemo(() => {
    return selectedModelFields?.map((field) => ({
      label: field.label,
      value: field.ZUID,
    }));
  }, [selectedModelFields]);
  const [
    deleteContentModelField,
    { isLoading: isDeletingField, isSuccess: isFieldDeleted },
  ] = useDeleteContentModelFieldMutation();
  const [
    undeleteContentModelField,
    { isLoading: isUndeletingField, isSuccess: isFieldUndeleted },
  ] = useUndeleteContentModelFieldMutation();
  const dispatch = useDispatch();
  const [isDefaultValueEnabled, setIsDefaultValueEnabled] = useState(
    fieldData?.settings?.defaultValue !== null &&
      fieldData?.settings?.defaultValue !== undefined
  );

  /** Initiate field type form */
  useEffect(() => {
    let formFields: { [key: string]: FormValue } = {};
    let errors: { [key: string]: string } = {};

    if (!FORM_CONFIG[type]) {
      return;
    }

    const flattenedFormConfig = [
      ...FORM_CONFIG[type]?.details,
      ...FORM_CONFIG[type]?.rules,
    ];

    flattenedFormConfig?.forEach((field) => {
      if (isUpdateField) {
        if (field.name === "list") {
          formFields.list = fieldData.settings.list;
        } else if (field.name === "limit") {
          formFields[field.name] = fieldData.settings[field.name];
        } else if (field.name === "group_id") {
          formFields[field.name] = fieldData.settings[field.name];
        } else if (field.name === "options") {
          // Convert the options object to an Array of objects for easier rendering
          const options = Object.entries(fieldData.settings.options ?? {})?.map(
            ([key, value]) => {
              return {
                [key]: value,
              };
            }
          );
          formFields.options = options;
        } else if (field.name === "tooltip") {
          formFields["tooltip"] = fieldData.settings.tooltip || "";
        } else if (field.name === "defaultValue") {
          formFields["defaultValue"] =
            fieldData.settings.defaultValue !== null &&
            fieldData.settings.defaultValue !== undefined
              ? fieldData.settings.defaultValue
              : null;
        } else if (field.name === "minCharLimit") {
          formFields["minCharLimit"] = fieldData.settings?.minCharLimit ?? null;
        } else if (field.name === "maxCharLimit") {
          formFields["maxCharLimit"] = fieldData.settings?.maxCharLimit ?? null;
        } else if (field.name === "regexMatchPattern") {
          formFields[field.name] = fieldData.settings[field.name] || null;
        } else if (field.name === "regexMatchErrorMessage") {
          formFields[field.name] = fieldData.settings[field.name] || null;
        } else if (field.name === "regexRestrictPattern") {
          formFields[field.name] = fieldData.settings[field.name] || null;
        } else if (field.name === "regexRestrictErrorMessage") {
          formFields[field.name] = fieldData.settings[field.name] || null;
        } else if (field.name === "minValue") {
          formFields[field.name] = fieldData.settings[field.name] ?? null;
        } else if (field.name === "maxValue") {
          formFields[field.name] = fieldData.settings[field.name] ?? null;
        } else if (field.name === "currency") {
          formFields[field.name] = fieldData.settings?.currency ?? "USD";
        } else if (field.name === "fileExtensions") {
          formFields[field.name] = fieldData.settings[field.name] ?? null;
        } else if (field.name === "fileExtensionsErrorMessage") {
          formFields[field.name] = fieldData.settings[field.name] ?? null;
        } else {
          formFields[field.name] = fieldData[field.name] as FormValue;
        }

        // Add the field name to the errors object if the field requires any validation
        if (field.validate?.length) {
          errors[field.name] = "";
        }
      } else {
        if (field.type === "checkbox") {
          // Only "list" checkbox will be checked by default
          formFields[field.name] = field.name === "list";
        } else if (field.type === "options") {
          formFields[field.name] = [{ "": "" }];
        } else if (field.type === "toggle_options") {
          formFields[field.name] = [{ 0: "No" }, { 1: "Yes" }];
        } else {
          if (
            field.name === "defaultValue" ||
            field.name === "minCharLimit" ||
            field.name === "maxCharLimit" ||
            field.name === "regexMatchPattern" ||
            field.name === "regexMatchErrorMessage" ||
            field.name === "regexRestrictPattern" ||
            field.name === "regexRestrictErrorMessage" ||
            field.name === "minValue" ||
            field.name === "maxValue" ||
            field.name === "fileExtensions" ||
            field.name === "fileExtensionsErrorMessage"
          ) {
            formFields[field.name] = null;
          } else {
            formFields[field.name] = "";
          }
        }

        // Add the field name to the errors object if the field requires any validation
        if (field.validate?.length) {
          errors[field.name] = "";
        }
      }
    });

    setFormData(formFields);
    setErrors(errors);
  }, [type, fieldData, mediaFoldersOptions.length]);

  useEffect(() => {
    if (isBulkUpdated) {
      if (isAddAnotherFieldClicked) {
        onCreateAnotherField();
      } else {
        onModalClose();
      }
    }
  }, [isBulkUpdated]);

  useEffect(() => {
    // In-between field creation flow (bulk update field sort after field creation)
    if (isFieldCreated && isInbetweenField) {
      const activeFields = fields.filter((field) => !field?.deletedAt);
      const fieldsToUpdate: ContentModelField[] = activeFields
        .slice(sortIndex)
        .map((field) => ({
          ...field,
          sort: field.sort + 1,
        }));

      bulkUpdateContentModelField({ modelZUID: id, fields: fieldsToUpdate });
    }

    // Regular field creation flow
    if ((isFieldCreated || isFieldUpdated) && !isInbetweenField) {
      if (isAddAnotherFieldClicked) {
        onCreateAnotherField();
      } else {
        onModalClose();
      }
    }
  }, [isFieldCreated, isFieldUpdated]);

  /** Error setting */
  useEffect(() => {
    if (!Object.keys(formData).length) {
      return;
    }

    const currFieldNames = fields.map((field) => field.name);
    let newErrorsObj: Errors = {};

    Object.keys(formData).map((inputName) => {
      if (
        inputName === "defaultValue" &&
        isDefaultValueEnabled &&
        (formData.defaultValue === "" || formData.defaultValue === null)
      ) {
        newErrorsObj[inputName] = "Required Field. Please enter a value.";
      }

      if (type === "text" || type === "textarea") {
        if (inputName === "minCharLimit" && !isNaN(+formData.minCharLimit)) {
          if ((formData.minCharLimit as number) > MaxLengths[type]) {
            newErrorsObj[
              inputName
            ] = `Cannot exceed ${MaxLengths[type]} characters`;
          } else if (formData.minCharLimit > formData.maxCharLimit) {
            newErrorsObj[inputName] = "Cannot exceed maximum character count";
          }
        }

        if (
          inputName === "maxCharLimit" &&
          !isNaN(+formData.maxCharLimit) &&
          (formData.maxCharLimit as number) > MaxLengths[type]
        ) {
          newErrorsObj[
            inputName
          ] = `Cannot exceed ${MaxLengths[type]} characters`;
        }

        if (inputName === "regexMatchPattern" && formData.regexMatchPattern) {
          try {
            new RegExp(formData.regexMatchPattern as string);
          } catch (e) {
            newErrorsObj[inputName] = "Invalid regex pattern";
          }
        }

        if (
          inputName === "regexMatchErrorMessage" &&
          formData.regexMatchPattern !== null &&
          formData.regexMatchErrorMessage === ""
        ) {
          newErrorsObj[inputName] = "Required Field. Please enter a value.";
        }

        if (
          inputName === "regexRestrictPattern" &&
          formData.regexRestrictPattern
        ) {
          try {
            new RegExp(formData.regexRestrictPattern as string);
          } catch (e) {
            newErrorsObj[inputName] = "Invalid regex pattern";
          }
        }

        if (
          inputName === "regexRestrictErrorMessage" &&
          formData.regexRestrictPattern !== null &&
          formData.regexRestrictErrorMessage === ""
        ) {
          newErrorsObj[inputName] = "Required Field. Please enter a value.";
        }
      }

      if (inputName === "minValue" && formData.minValue) {
        if (isNaN(+formData.minValue)) {
          newErrorsObj[inputName] = "Invalid number";
        } else if (formData.minValue > formData.maxValue) {
          newErrorsObj[inputName] = "Cannot exceed maximum value";
        }
      }

      if (inputName === "maxValue" && formData.maxValue) {
        if (isNaN(+formData.maxValue)) {
          newErrorsObj[inputName] = "Invalid number";
        } else if (formData.maxValue < formData.minValue) {
          newErrorsObj[inputName] = "Cannot be less than minimum value";
        }
      }

      if (inputName === "currency" && !formData.currency) {
        newErrorsObj[inputName] = "Please select a currency";
      }

      if (
        inputName === "fileExtensions" &&
        formData.fileExtensions !== null &&
        !(formData.fileExtensions as string[])?.length
      ) {
        newErrorsObj[inputName] = "This field is required";
      }

      if (
        inputName === "fileExtensionsErrorMessage" &&
        formData.fileExtensions !== null &&
        formData.fileExtensionsErrorMessage === ""
      ) {
        newErrorsObj[inputName] = "This field is required";
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

  useEffect(() => {
    if (fieldCreationError || fieldUpdateError) {
      let errorMsg = "";

      if (fieldCreationError) {
        errorMsg = "Failed to create the field";
      }

      if (fieldUpdateError) {
        errorMsg = "Failed to update the field";
      }

      dispatch(
        notify({
          message: errorMsg,
          kind: "error",
        })
      );
    }
  }, [fieldCreationError, fieldUpdateError]);

  useEffect(() => {
    if (isFieldDeleted) {
      dispatch(
        notify({
          message: `\"${fieldData?.label}\" field is deactivated`,
          kind: "success",
        })
      );
    }
  }, [isFieldDeleted]);

  useEffect(() => {
    if (isFieldUndeleted) {
      dispatch(
        notify({
          message: `\"${fieldData?.label}\" field is reactivated`,
          kind: "success",
        })
      );
    }
  }, [isFieldUndeleted]);

  const handleSubmitForm = () => {
    setIsSubmitClicked(true);
    const hasErrors = Object.values(errors)
      .flat(2)
      .some((error) => error.length);
    const sort = isInbetweenField ? sortIndex : fields?.length;

    if (hasErrors) {
      // Switch the active tab to details to show the user the errors if
      // they're not on the details tab and they clicked the submit button
      if (
        errors.defaultValue ||
        errors.minCharLimit ||
        errors.maxCharLimit ||
        errors.regexMatchPattern ||
        errors.regexMatchErrorMessage ||
        errors.regexRestrictPattern ||
        errors.regexRestrictErrorMessage ||
        errors.minValue ||
        errors.maxValue ||
        errors.fileExtensions ||
        errors.fileExtensionsErrorMessage
      ) {
        setActiveTab("rules");
      } else {
        setActiveTab("details");
      }

      return;
    }

    // Common field values
    let body: Omit<
      ContentModelField,
      "ZUID" | "datatypeOptions" | "createdAt" | "updatedAt" | "deletedAt"
    > = {
      contentModelZUID: id,
      name: formData.name as string,
      label: formData.label as string,
      description: formData.description as string,
      datatype: type,
      required: formData.required as boolean,
      settings: {
        list: formData.list as boolean,
        limit: formData.limit as number,
        group_id: formData.group_id as string,
        ...((formData.tooltip as string)?.length && {
          tooltip: formData.tooltip as string,
        }),
        defaultValue: formData.defaultValue as string,
        ...(formData.maxCharLimit !== null && {
          maxCharLimit: formData.maxCharLimit as number,
        }),
        ...(formData.minCharLimit !== null && {
          minCharLimit: formData.minCharLimit as number,
        }),
        ...(formData.regexMatchPattern && {
          regexMatchPattern: formData.regexMatchPattern as string,
        }),
        ...(formData.regexMatchErrorMessage && {
          regexMatchErrorMessage: formData.regexMatchErrorMessage as string,
        }),
        ...(formData.regexRestrictPattern && {
          regexRestrictPattern: formData.regexRestrictPattern as string,
        }),
        ...(formData.regexRestrictErrorMessage && {
          regexRestrictErrorMessage:
            formData.regexRestrictErrorMessage as string,
        }),
        ...(formData.minValue !== null && {
          minValue: formData.minValue as number,
        }),
        ...(formData.maxValue !== null && {
          maxValue: formData.maxValue as number,
        }),
        ...(formData.currency !== null && {
          currency: formData.currency as string,
        }),
        ...(formData.fileExtensions && {
          fileExtensions: formData.fileExtensions as string[],
        }),
        ...(formData.fileExtensionsErrorMessage && {
          fileExtensionsErrorMessage:
            formData.fileExtensionsErrorMessage as string,
        }),
      },
      sort: isUpdateField ? fieldData.sort : sort, // Just use the length since sort starts at 0
    };

    if (type === "one_to_one" || type === "one_to_many") {
      body.relatedModelZUID = formData.relatedModelZUID || null;
      body.relatedFieldZUID = formData.relatedFieldZUID || null;
    }

    if (type === "dropdown" || type === "yes_no") {
      const options = formData.options as FieldSettingsOptions[];
      const optionsObject = options.reduce(
        (acc: FieldSettingsOptions, curr: FieldSettingsOptions) => {
          return { ...acc, ...curr };
        },
        {}
      );

      body.settings.options = optionsObject;
    }

    if (isUpdateField) {
      const updateBody: ContentModelField = {
        ...fieldData,
        ...body,
      };

      updateContentModelField({
        modelZUID: id,
        fieldZUID: fieldData.ZUID,
        body: updateBody,
      })
        .unwrap()
        .then(() => {
          // Update the field state after field changes are done
          if (fieldStateOnSaveAction === "reactivate" && fieldData?.deletedAt) {
            undeleteContentModelField({
              modelZUID: id,
              fieldZUID: fieldData?.ZUID,
            });
          } else if (
            fieldStateOnSaveAction === "deactivate" &&
            !fieldData?.deletedAt
          ) {
            deleteContentModelField({
              modelZUID: id,
              fieldZUID: fieldData?.ZUID,
            });
          }
        });
    } else {
      // We want to skip field cache invalidation when creating an in-between field
      // We'll let the bulk update rtk query do the invalidation after this call
      // Ensures FieldList gets the field data with proper sorting from bulk update rtk query already
      createContentModelField({
        modelZUID: id,
        body,
        skipInvalidation: isInbetweenField,
      });
    }
  };

  const handleFieldDataChange = ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => {
    const isAutoPopulateName = inputName === "label" && !isUpdateField;

    // Form data update
    setFormData((prevData) => ({
      ...prevData,
      [inputName]:
        inputName === "name" ? convertLabelValue(value as string) : value,
    }));

    // Auto populate "name" when "label" field changes
    if (isAutoPopulateName) {
      setFormData((prevData) => ({
        ...prevData,
        name: convertLabelValue(value as string),
      }));
    }

    // Reset relatedFieldZUID when model zuid changes
    if (inputName === "relatedModelZUID") {
      setFormData((prevData) => ({
        ...prevData,
        relatedFieldZUID: "",
      }));
    }
  };

  const handleAddAnotherField = () => {
    setIsAddAnotherFieldClicked(true);
    handleSubmitForm();
  };

  return (
    <>
      <DialogTitle
        component="div"
        sx={{
          borderBottom: "2px solid",
          borderColor: "border",
          pb: 0,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            {!isUpdateField && (
              <IconButton
                data-cy="BackToFieldSelectionBtn"
                size="small"
                onClick={onBackClick}
                sx={{ mr: 1.5 }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Box pr={1.5}>
              <FieldIcon
                type={type}
                height="28px"
                width="28px"
                fontSize="16px"
              />
            </Box>
            <Box display="flex" flexDirection="column">
              <Typography variant="h5" fontWeight={700}>
                {isUpdateField
                  ? `Edit ${fieldData.label}`
                  : `Add ${name} Field`}
              </Typography>
              <Typography variant="body3" color="text.secondary">
                {isUpdateField
                  ? `${TYPE_TEXT[type]} Field`
                  : FIELD_COPY_CONFIG[getCategory(type)]?.find(
                      (item) => item.type === type
                    )?.subHeaderText}
              </Typography>
            </Box>
          </Box>
          <IconButton
            data-cy="AddFieldCloseBtn"
            size="small"
            onClick={onModalClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(_, value: ActiveTab) => setActiveTab(value)}
          sx={{
            position: "relative",
            top: "2px",
          }}
        >
          <Tab
            data-cy="DetailsTabBtn"
            value="details"
            label="Details"
            icon={<InfoRoundedIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            data-cy="RulesTabBtn"
            value="rules"
            label="Rules"
            icon={<RuleRoundedIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            data-cy="LearnTabBtn"
            value="learn"
            label="Learn"
            icon={<MenuBookRoundedIcon fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          pt: 2.5,
          pl: activeTab === "details" ? 0 : 2.5,
          backgroundColor: "grey.50",
          borderTop: 0,
        }}
      >
        {activeTab === "details" && (
          <Grid
            data-cy="DetailsTab"
            container
            rowSpacing={2.5}
            columnSpacing={2.5}
            width="inherit"
            // minHeight={448}
            ml={0}
          >
            {FORM_CONFIG[type]?.details?.map((fieldConfig, index) => {
              // Only show tooltip field when updating a field that already has a tooltip value
              const hideTooltipField =
                fieldConfig.name === "tooltip" &&
                (!isUpdateField || !fieldData.settings?.tooltip?.length);

              if (hideTooltipField) return;

              let dropdownOptions: DropdownOptions[];
              let disabled = false;
              let renderOption: any;
              let filterOptions: any;
              let autocompleteConfig: AutocompleteConfig = {};

              if (fieldConfig.name === "relatedModelZUID") {
                dropdownOptions = modelsOptions;
                disabled = isLoadingModels;
              }

              if (fieldConfig.name === "relatedFieldZUID") {
                dropdownOptions = fieldsOptions;
                disabled = isFetchingSelectedModelFields;
              }

              if (fieldConfig.name === "currency") {
                const selectedValue = currencies.find(
                  (currency) => currency.value === formData.currency
                );
                dropdownOptions = currencies;
                renderOption = (props: any, value: Currency) => (
                  <ListItem
                    {...props}
                    key={value.value}
                    sx={{ color: "text.primary" }}
                  >
                    <Box
                      component="img"
                      height={16}
                      src={`/images/flags/${value.countryCode?.toLowerCase()}.svg`}
                      loading="lazy"
                      alt={`${value.countryCode} flag`}
                    />
                    <Typography variant="body1" fontWeight={700} pl={1}>
                      {value.value} {value.symbol_native} &nbsp;
                    </Typography>
                    <Typography variant="body1">{value.label}</Typography>
                  </ListItem>
                );
                filterOptions = (options: Currency[], state: any) => {
                  if (state.inputValue) {
                    return options.filter(
                      (option) =>
                        option.label
                          ?.toLowerCase()
                          .includes(state.inputValue.toLowerCase()) ||
                        option.value
                          ?.toLowerCase()
                          .includes(state.inputValue.toLowerCase())
                    );
                  } else {
                    return options;
                  }
                };
                autocompleteConfig.inputProps = {
                  startAdornment: !!selectedValue && (
                    <InputAdornment
                      position="start"
                      sx={{
                        pl: 0.25,

                        "&.MuiInputAdornment-root.MuiInputAdornment-positionStart":
                          {
                            color: "text.primary",
                          },
                      }}
                    >
                      <Box
                        component="img"
                        height={16}
                        src={`/images/flags/${selectedValue.countryCode?.toLowerCase()}.svg`}
                        loading="lazy"
                        alt={`${selectedValue.countryCode} flag`}
                      />
                      <Typography variant="body1" fontWeight={700} pl={1}>
                        {selectedValue.value} {selectedValue.symbol_native}
                      </Typography>
                    </InputAdornment>
                  ),
                };
                autocompleteConfig.maxHeight = 256;
              }

              return (
                <FieldFormInput
                  key={index}
                  fieldConfig={fieldConfig}
                  onDataChange={handleFieldDataChange}
                  errorMsg={isSubmitClicked && errors[fieldConfig.name]}
                  prefillData={formData[fieldConfig.name]}
                  dropdownOptions={dropdownOptions || []}
                  disabled={disabled}
                  renderOption={renderOption}
                  filterOptions={filterOptions}
                  autocompleteConfig={autocompleteConfig}
                />
              );
            })}
            {isUpdateField && (
              <Grid item xs={12}>
                <LoadingButton
                  data-cy="DeactivateReactivateFieldUpdateModal"
                  variant="outlined"
                  color="inherit"
                  startIcon={
                    fieldStateOnSaveAction === "deactivate" ? (
                      <PlayCircleFilledRoundedIcon color="action" />
                    ) : (
                      <PauseCircleOutlineRoundedIcon color="action" />
                    )
                  }
                  onClick={() => {
                    setFieldStateOnSaveAction(
                      fieldStateOnSaveAction === "deactivate"
                        ? "reactivate"
                        : "deactivate"
                    );
                  }}
                  loading={isDeletingField || isUndeletingField}
                >
                  {fieldStateOnSaveAction === "deactivate"
                    ? "Reactivate Field"
                    : "Deactivate Field"}
                </LoadingButton>
              </Grid>
            )}
          </Grid>
        )}

        {activeTab === "rules" && (
          <Rules
            type={type}
            onFieldDataChanged={handleFieldDataChange}
            mediaFoldersOptions={mediaFoldersOptions}
            formData={formData}
            isSubmitClicked={isSubmitClicked}
            errors={errors}
            isDefaultValueEnabled={isDefaultValueEnabled}
            setIsDefaultValueEnabled={setIsDefaultValueEnabled}
          />
        )}

        {activeTab === "learn" && <Learn type={type} />}
      </DialogContent>
      {isUpdateField ? (
        <DialogActions
          sx={{
            pt: 2.5,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={onModalClose}
            sx={{
              mr: 1,
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            data-cy="FieldFormAddFieldBtn"
            loading={isUpdatingField}
            onClick={handleSubmitForm}
            variant="contained"
            startIcon={<SaveRoundedIcon />}
          >
            Save
          </LoadingButton>
        </DialogActions>
      ) : (
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2.5,
          }}
        >
          <Button variant="outlined" color="inherit" onClick={onBackClick}>
            Cancel
          </Button>
          <Box>
            <LoadingButton
              data-cy="FieldFormAddAnotherFieldBtn"
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              sx={{
                mr: 2,
              }}
              loading={isCreatingField || isBulkUpdating}
              onClick={handleAddAnotherField}
            >
              Add Another Field
            </LoadingButton>
            <LoadingButton
              data-cy="FieldFormAddFieldBtn"
              loading={isCreatingField || isBulkUpdating}
              onClick={handleSubmitForm}
              variant="contained"
            >
              Add Field
            </LoadingButton>
          </Box>
        </DialogActions>
      )}
    </>
  );
};
