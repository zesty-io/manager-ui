import { useState, useEffect } from "react";
import { useParams } from "react-router";
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

import { FieldIcon } from "../../Field/FieldIcon";
import { FieldFormInput, DropdownOptions } from "../FieldFormInput";
import { useMediaRules, LockFolder } from "../hooks/useMediaRules";
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
} from "../../../../../../../shell/services/instance";
import {
  ContentModelField,
  FieldSettings,
  ContentModelFieldValue,
  FieldSettingsOptions,
  Bin,
} from "../../../../../../../shell/services/types";
import { FIELD_COPY_CONFIG, TYPE_TEXT, FORM_CONFIG } from "../../configs";
import { ComingSoon } from "../ComingSoon";
import { Learn } from "../Learn";
import { useSelector } from "react-redux";
import { mediaManagerApi } from "../../../../../../../shell/services/mediaManager";
import { AppState } from "../../../../../../../shell/store/types";

type ActiveTab = "details" | "rules" | "learn";
type Params = {
  id: string;
};
export type FormValue = Exclude<ContentModelFieldValue, FieldSettings>;
export interface FormData {
  [key: string]: FormValue;
}
interface Errors {
  [key: string]: string | [string, string][];
}
interface Props {
  type: string;
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
  const [isAddAnotherFieldClicked, setIsAddAnotherFieldClicked] =
    useState(false);
  const {
    itemLimit,
    lockFolder,
    setItemLimit,
    setLockFolder,
    mediaFoldersOptions,
  } = useMediaRules();

  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<FormData>({});
  const params = useParams<Params>();
  const { id } = params;
  const [
    createContentModelField,
    { isLoading: isCreatingField, isSuccess: isFieldCreated },
  ] = useCreateContentModelFieldMutation();
  const [
    updateContentModelField,
    { isLoading: isUpdatingField, isSuccess: isFieldUpdated },
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
  const modelsOptions: DropdownOptions[] = allModels?.map((model) => ({
    label: model.label,
    value: model.ZUID,
  }));
  const fieldsOptions: DropdownOptions[] = selectedModelFields?.map(
    (field) => ({
      label: field.label,
      value: field.ZUID,
    })
  );

  useEffect(() => {
    let formFields: { [key: string]: FormValue } = {};
    let errors: { [key: string]: string } = {};

    FORM_CONFIG[type]?.forEach((field) => {
      if (isUpdateField) {
        if (field.name === "list") {
          formFields.list = fieldData.settings.list;
        } else if (field.name === "limit") {
          formFields[field.name] = fieldData.settings[field.name];
          setItemLimit((prevData: any) => ({
            ...prevData,
            isChecked: Boolean(fieldData.settings.limit),
          }));
        } else if (field.name === "group_id") {
          formFields[field.name] = fieldData.settings[field.name];
          if (mediaFoldersOptions.length) {
            setLockFolder((prevData: LockFolder) => ({
              ...prevData,
              option:
                mediaFoldersOptions.find(
                  (option: any) => option.value === fieldData.settings.group_id
                ) || lockFolder.option,
              isChecked: Boolean(fieldData.settings.group_id),
            }));
          }
        } else if (field.name === "options") {
          // Convert the options object to an Array of objects for easier rendering
          const options = Object.entries(fieldData.settings.options).map(
            ([key, value]) => {
              return {
                [key]: value,
              };
            }
          );
          formFields.options = options;
        } else {
          formFields[field.name] = fieldData[field.name] as FormValue;
        }

        // Add the field name to the errors object if the field requires any validation
        if (field.validate?.length) {
          errors[field.name] = "";
        }
      } else {
        if (field.type === "checkbox") {
          formFields[field.name] = false;
        } else if (field.type === "options") {
          formFields[field.name] = [{ "": "" }];
        } else {
          formFields[field.name] = "";
        }

        formFields["group_id"] = "";
        formFields["limit"] = "";

        // Add the field name to the errors object if the field requires any validation
        if (field.validate?.length) {
          errors[field.name] = "";
        }
      }
    });

    setFormData(formFields);
    setErrors(errors);
  }, [type, fieldData]);

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
      const fieldsToUpdate: ContentModelField[] = fields
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

  useEffect(() => {
    if (!Object.keys(formData).length) {
      return;
    }

    const currFieldNames = fields.map((field) => field.name);
    let newErrorsObj: Errors = {};

    Object.keys(formData).map((inputName) => {
      if (inputName in errors) {
        const { maxLength, label, validate } = FORM_CONFIG[type].find(
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
  }, [formData]);

  const handleSubmitForm = () => {
    setIsSubmitClicked(true);
    const hasErrors = Object.values(errors)
      .flat(2)
      .some((error) => error.length);
    const sort = isInbetweenField ? sortIndex : fields?.length;

    if (hasErrors) {
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
      },
      sort: isUpdateField ? fieldData.sort : sort, // Just use the length since sort starts at 0
    };

    if (type === "one_to_one" || type === "one_to_many") {
      body.relatedModelZUID = formData.relatedModelZUID || null;
      body.relatedFieldZUID = formData.relatedFieldZUID || null;
    }

    if (type === "dropdown") {
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
    value: string | boolean;
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
        sx={{
          padding: 2.5,
          paddingBottom: 0,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pb={0.5}
        >
          <Box display="flex" alignItems="center">
            {!isUpdateField && (
              <IconButton size="small" onClick={onBackClick}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Box px={1.5}>
              <FieldIcon
                type={type}
                height="28px"
                width="28px"
                fontSize="16px"
              />
            </Box>
            <Box display="flex" flexDirection="column">
              <Typography variant="h5" fontWeight={600}>
                {isUpdateField
                  ? `Edit ${fieldData.label}`
                  : `Add ${name} Field`}
              </Typography>
              <Typography
                // @ts-expect-error body3 additional variant is not on Typography augmentation
                variant="body3"
                color="text.secondary"
              >
                {isUpdateField
                  ? `${TYPE_TEXT[type]} Field`
                  : FIELD_COPY_CONFIG[getCategory(type)]?.find(
                      (item) => item.type === type
                    )?.subHeaderText}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onModalClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(_, value: ActiveTab) => setActiveTab(value)}
          sx={{
            ".Mui-selected": {
              svg: {
                color: "primary.main",
              },
            },
          }}
        >
          <Tab
            value="details"
            label="Details"
            icon={<InfoRoundedIcon color="action" />}
            iconPosition="start"
          />
          <Tab
            value="rules"
            label="Rules"
            icon={<RuleRoundedIcon color="action" />}
            iconPosition="start"
          />
          <Tab
            value="learn"
            label="Learn"
            icon={<MenuBookRoundedIcon color="action" />}
            iconPosition="start"
          />
        </Tabs>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 2.5,
        }}
      >
        {activeTab === "details" && (
          <Grid container spacing={2.5} maxWidth="480px">
            {FORM_CONFIG[type]?.map((fieldConfig, index) => {
              let dropdownOptions: DropdownOptions[];
              let disabled = false;

              if (fieldConfig.name === "relatedModelZUID") {
                dropdownOptions = modelsOptions;
                disabled = isLoadingModels;
              }

              if (fieldConfig.name === "relatedFieldZUID") {
                dropdownOptions = fieldsOptions;
                disabled = isFetchingSelectedModelFields;
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
                />
              );
            })}
            {/* TODO: Add functionality once deactivate flow is provided */}
            {isUpdateField && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<PauseCircleOutlineRoundedIcon />}
                >
                  Deactivate Field
                </Button>
              </Grid>
            )}
          </Grid>
        )}

        {activeTab === "rules" && type !== "images" ? (
          <ComingSoon />
        ) : (
          activeTab === "rules" &&
          type === "images" && (
            <MediaRules
              fieldConfig={FORM_CONFIG["images"].filter(
                (data) => data.tab === "rules"
              )}
              onDataChange={handleFieldDataChange}
              itemLimit={itemLimit}
              lockFolder={lockFolder}
              setItemLimit={setItemLimit}
              setLockFolder={setLockFolder}
              groups={mediaFoldersOptions}
            />
          )
        )}
        {activeTab === "learn" && <Learn type={type} />}
      </DialogContent>
      {isUpdateField ? (
        <DialogActions
          sx={{
            p: 2.5,
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
            px: 3,
            py: 2,
          }}
        >
          <Button variant="outlined" color="inherit" onClick={onBackClick}>
            Cancel
          </Button>
          <Box>
            <LoadingButton
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              sx={{
                mr: 2,
              }}
              loading={isCreatingField || isBulkUpdating}
              onClick={handleAddAnotherField}
            >
              Add another field
            </LoadingButton>
            <LoadingButton
              loading={isCreatingField || isBulkUpdating}
              onClick={handleSubmitForm}
              variant="contained"
            >
              Done
            </LoadingButton>
          </Box>
        </DialogActions>
      )}
    </>
  );
};
