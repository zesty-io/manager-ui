import { useState, useEffect } from "react";
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
  ListItem,
  InputAdornment,
  Fade,
} from "@mui/material";
import { isEmpty } from "lodash";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VerticalSplitRoundedIcon from "@mui/icons-material/VerticalSplitRounded";

import { FieldIcon } from "../../Field/FieldIcon";
import { useMediaRules } from "../../hooks/useMediaRules";
import { getCategory } from "../../../utils";
import {
  useCreateContentModelFieldMutation,
  useUpdateContentModelFieldMutation,
  useBulkUpdateContentModelFieldMutation,
  useDeleteContentModelFieldMutation,
  useUndeleteContentModelFieldMutation,
} from "../../../../../../../shell/services/instance";
import {
  FieldFormProvider,
  useFieldForm,
  FormData,
  Errors,
  FormValue,
  FieldBody,
} from "../../contexts/FieldFormProvider";

export { FieldFormProvider, useFieldForm };
export type { FormData, Errors, FormValue, FieldBody };
import {
  ContentModelField,
  FieldSettingsOptions,
  ContentModelFieldDataType,
  IntegrationFieldConfig,
  RepeaterSubField,
} from "../../../../../../../shell/services/types";
import { FIELD_COPY_CONFIG, TYPE_TEXT } from "../../configs";
import { Learn } from "../Learn";
import { notify } from "../../../../../../../shell/store/notifications";
import { Rules } from "./Rules";
import { RepeaterFields } from "./RepeaterFields";
import { Details } from "../Details";

type ActiveTab = "details" | "rules" | "learn" | "repeater";
type Params = {
  id: string;
};
type FieldFormProps = {
  type: ContentModelFieldDataType;
  name: string;
  onModalClose: () => void;
  onBackClick?: () => void;
  fields: ContentModelField[];
  fieldData?: ContentModelField;
  sortIndex?: number | null;
  onCreateAnotherField?: () => void;
};

const FieldFormContent = ({
  type,
  name,
  onModalClose,
  onBackClick,
  fields,
  fieldData,
  sortIndex,
  onCreateAnotherField,
}: FieldFormProps) => {
  const isUpdateField = !isEmpty(fieldData);
  const showRepeaterFieldsTab = type === "repeater" && isUpdateField;
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    showRepeaterFieldsTab ? "repeater" : "details"
  );
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const [fieldStateOnSaveAction, setFieldStateOnSaveAction] = useState<
    "deactivate" | "reactivate"
  >(fieldData?.deletedAt ? "reactivate" : "reactivate");
  const [isAddAnotherFieldClicked, setIsAddAnotherFieldClicked] =
    useState(false);
  const { mediaFoldersOptions } = useMediaRules();

  const {
    formData,
    errors,
    handleFieldDataChange,
    isDefaultValueEnabled,
    setIsDefaultValueEnabled,
  } = useFieldForm();
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
    { isLoading: isUpdatingField, isSuccess: isFieldUpdated },
  ] = useUpdateContentModelFieldMutation();
  const [
    bulkUpdateContentModelField,
    { isLoading: isBulkUpdating, isSuccess: isBulkUpdated },
  ] = useBulkUpdateContentModelFieldMutation();
  const isInbetweenField = sortIndex !== null;
  const [
    deleteContentModelField,
    { isLoading: isDeletingField, isSuccess: isFieldDeleted },
  ] = useDeleteContentModelFieldMutation();
  const [
    undeleteContentModelField,
    { isLoading: isUndeletingField, isSuccess: isFieldUndeleted },
  ] = useUndeleteContentModelFieldMutation();
  const dispatch = useDispatch();

  // Initialization is handled in FieldFormProvider

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

  // Validation is handled in FieldFormProvider

  useEffect(() => {
    if (fieldCreationError) {
      dispatch(
        notify({
          message: "Failed to create the field",
          kind: "error",
        })
      );
    }
  }, [fieldCreationError]);

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
    const highestSortValue = fields.reduce(
      (max, field) => (field.sort > max ? field.sort : max),
      0
    );

    const sort = isInbetweenField ? sortIndex : highestSortValue + 1;

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
    let body: FieldBody = {
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
        ...(formData.subFields && {
          subFields: formData.subFields as RepeaterSubField[],
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

    if (type === "integration") {
      body.settings.integrationFieldConfig =
        formData?.integrationFieldConfig as IntegrationFieldConfig;
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
            // added a delay to temporarily fix an issue with field not being deleted properly
            // likely related to api response caching
            setTimeout(() => {
              deleteContentModelField({
                modelZUID: id,
                fieldZUID: fieldData?.ZUID,
              });
            }, 1000);
          }
        })
        .catch((error) => {
          console.error("Failed to update the field", error);
          dispatch(
            notify({
              message: "Failed to update the field",
              kind: "error",
            })
          );
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
          {showRepeaterFieldsTab && (
            <Tab
              data-cy="RepeaterFieldsTabBtn"
              value="repeater"
              label="Fields"
              icon={<VerticalSplitRoundedIcon fontSize="small" />}
              iconPosition="start"
            />
          )}
          <Tab
            data-cy="DetailsTabBtn"
            value="details"
            label="Details"
            icon={<InfoRoundedIcon fontSize="small" />}
            iconPosition="start"
          />
          {type !== "repeater" && (
            <Tab
              data-cy="RulesTabBtn"
              value="rules"
              label="Rules"
              icon={<RuleRoundedIcon fontSize="small" />}
              iconPosition="start"
            />
          )}
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
        {activeTab === "repeater" && (
          <RepeaterFields
            name={fieldData.name}
            label={fieldData.label}
            fields={formData.subFields as FieldBody[]}
            onChange={(fields) => {
              handleFieldDataChange({ inputName: "subFields", value: fields });
            }}
          />
        )}

        {activeTab === "details" && (
          <Details
            type={type}
            isUpdateField={isUpdateField}
            fieldData={fieldData}
            onFieldDataChange={handleFieldDataChange}
            formData={formData}
            isSubmitClicked={isSubmitClicked}
            errors={errors}
            fieldStateOnSaveAction={fieldStateOnSaveAction}
            setFieldStateOnSaveAction={setFieldStateOnSaveAction}
            isDeletingField={isDeletingField}
            isUndeletingField={isUndeletingField}
            canDeactivate
          />
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
          <Button
            data-cy="FieldFormAddFieldBtn"
            loading={isUpdatingField}
            onClick={handleSubmitForm}
            variant="contained"
            startIcon={<SaveRoundedIcon />}
          >
            Save
          </Button>
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
            <Button
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
            </Button>
            <Button
              data-cy="FieldFormAddFieldBtn"
              loading={isCreatingField || isBulkUpdating}
              onClick={handleSubmitForm}
              variant="contained"
            >
              Add Field
            </Button>
          </Box>
        </DialogActions>
      )}
    </>
  );
};

export const FieldForm = (props: FieldFormProps) => {
  return (
    <FieldFormProvider
      type={props.type}
      fields={props.fields}
      fieldData={props.fieldData}
    >
      <FieldFormContent {...props} />
    </FieldFormProvider>
  );
};
