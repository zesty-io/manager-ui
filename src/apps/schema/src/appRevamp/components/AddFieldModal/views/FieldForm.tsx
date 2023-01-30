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
  CircularProgress,
  Grid,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { isEmpty } from "lodash";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { FieldIcon } from "../../Field/FieldIcon";
import {
  stringStartsWithVowel,
  convertLabelValue,
  getErrorMessage,
} from "../../utils";
import { InputField, FieldFormInput } from "../FieldFormInput";
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
} from "../../../../../../../shell/services/types";

const commonFields: InputField[] = [
  {
    name: "label",
    type: "input",
    label: "Label",
    required: true,
    fullWidth: true,
    maxLength: 200,
    gridSize: 12,
  },
  {
    name: "name",
    type: "input",
    label: "API / Parsley Code Reference",
    required: true,
    fullWidth: true,
    maxLength: 50,
    gridSize: 12,
  },
  {
    name: "description",
    type: "input",
    label: "Description (optional)",
    subLabel: "Appears below the label to help content-writers and API users",
    required: false,
    fullWidth: true,
    multiline: true,
    gridSize: 12,
  },
  {
    name: "required",
    type: "checkbox",
    label: "Required field",
    subLabel: "Ensures an item cannot be created if field is empty",
    required: false,
    gridSize: 12,
  },
  {
    name: "list",
    type: "checkbox",
    label: "Add as column in table listing",
    subLabel: "Shows field as a column in the table in the content view",
    required: false,
    gridSize: 12,
  },
];
const formConfig: { [key: string]: InputField[] } = {
  article_writer: [],
  color: [],
  currency: [],
  date: [],
  datetime: [],
  dropdown: [],
  images: [],
  internal_link: [],
  link: [],
  markdown: [...commonFields],
  number: [],
  one_to_many: [
    {
      name: "relatedModelZUID",
      type: "dropdown",
      label: "Reference Model",
      required: false,
      gridSize: 6,
      placeholder: "Select a model",
    },
    {
      name: "relatedFieldZUID",
      type: "dropdown",
      label: "Field to Display",
      required: false,
      gridSize: 6,
      placeholder: "Select a field",
    },
    ...commonFields,
  ],
  one_to_one: [
    {
      name: "relatedModelZUID",
      type: "dropdown",
      label: "Reference Model",
      required: false,
      gridSize: 6,
      placeholder: "Select a model",
    },
    {
      name: "relatedFieldZUID",
      type: "dropdown",
      label: "Field to Display",
      required: false,
      gridSize: 6,
      placeholder: "Select a field",
    },
    ...commonFields,
  ],
  sort: [],
  text: [...commonFields],
  textarea: [...commonFields],
  uuid: [],
  wysiwyg_basic: [...commonFields],
  yes_no: [],
};

type ActiveTab = "details" | "rules";
type Params = {
  id: string;
};
export type FormValue = Exclude<ContentModelFieldValue, FieldSettings>;
interface FormData {
  [key: string]: FormValue;
}
interface Errors {
  [key: string]: string;
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
  const { data: models, isLoading: isLoadingModels } =
    useGetContentModelsQuery();
  const { data: modelFields } = useGetContentModelFieldsQuery(
    formData.relatedModelZUID as string,
    { skip: !formData.relatedModelZUID }
  );
  const isUpdateField = !isEmpty(fieldData);
  const isInbetweenField = sortIndex !== null;
  const modelsOptions: [string, string][] = models?.map((model) => [
    model.ZUID,
    model.label,
  ]);
  const fieldsOptions: [string, string][] = modelFields?.map((field) => [
    field.ZUID,
    field.label,
  ]);

  useEffect(() => {
    let formFields: { [key: string]: FormValue } = {};
    let errors: { [key: string]: string } = {};

    formConfig[type]?.forEach((field) => {
      if (isUpdateField) {
        if (field.name === "list") {
          formFields[field.name] = fieldData.settings[field.name];
        } else {
          formFields[field.name] = fieldData[field.name] as FormValue;
        }

        // Pre-fill error messages based on content
        if (field.required) {
          errors[field.name] = isEmpty(fieldData[field.name])
            ? "This field is required"
            : "";
        }
      } else {
        formFields[field.name] = field.type === "checkbox" ? false : "";

        // Pre-fill required fields error msgs
        if (field.required) {
          errors[field.name] = "This field is required";
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
        const { maxLength } = formConfig[type].find(
          (field) => field.name === inputName
        );

        // Special validation for "name"
        if (inputName === "name") {
          newErrorsObj.name = getErrorMessage({
            value: formData.name as string,
            fieldNames: currFieldNames,
            maxLength,
          });

          // When updating a field, user can choose to just leave the reference name the same
          if (isUpdateField && formData.name === fieldData.name) {
            newErrorsObj.name = "";
          }
        } else {
          // All other input validation
          newErrorsObj[inputName] = getErrorMessage({
            value: formData[inputName] as string,
            maxLength,
          });
        }
      }
    });

    setErrors(newErrorsObj);
  }, [formData]);

  const handleSubmitForm = () => {
    setIsSubmitClicked(true);
    const hasErrors = Object.values(errors).some((error) => error.length);
    const sort = isInbetweenField ? sortIndex : fields?.length;

    if (hasErrors) {
      return;
    }

    // Common field values
    let body: Omit<
      ContentModelField,
      "ZUID" | "datatypeOptions" | "createdAt" | "updatedAt"
    > = {
      contentModelZUID: id,
      name: formData.name as string,
      label: formData.label as string,
      description: formData.description as string,
      datatype: type,
      required: formData.required as boolean,
      settings: {
        list: formData.list as boolean,
      },
      sort: isUpdateField ? fieldData.sort : sort, // Just use the length since sort starts at 0
    };

    if (type === "one_to_one" || type === "one_to_many") {
      if (formData.relatedModelZUID) {
        body["relatedModelZUID"] = formData.relatedModelZUID;
      }

      if (formData.relatedFieldZUID) {
        body["relatedFieldZUID"] = formData.relatedFieldZUID;
      }
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

  const headerText = stringStartsWithVowel(name)
    ? `Add an ${name} Field`
    : `Add a ${name} Field`;

  return (
    <>
      <DialogTitle
        sx={{
          padding: 3,
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
            {isUpdateField ? fieldData.label : headerText}
          </Box>
          <IconButton size="small" onClick={onModalClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(_, value: ActiveTab) => setActiveTab(value)}
        >
          <Tab value="details" label="Details" />
          <Tab value="rules" label="Rules" />
        </Tabs>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          px: 3,
          py: 3,
        }}
      >
        {activeTab === "details" && (
          <Grid container rowSpacing={2.5} columnSpacing={2.5}>
            {formConfig[type]?.map((fieldConfig, index) => {
              let dropdownOptions: [string, string][];

              if (fieldConfig.name === "relatedModelZUID") {
                dropdownOptions = modelsOptions;
              }

              if (fieldConfig.name === "relatedFieldZUID") {
                dropdownOptions = fieldsOptions;
              }

              return (
                <FieldFormInput
                  key={index}
                  fieldConfig={fieldConfig}
                  onDataChange={handleFieldDataChange}
                  errorMsg={isSubmitClicked && errors[fieldConfig.name]}
                  prefillData={formData[fieldConfig.name]}
                  dropdownOptions={dropdownOptions}
                />
              );
            })}
          </Grid>
        )}

        {activeTab === "rules" && <Typography>Coming soon...</Typography>}
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={isUpdateField ? onModalClose : onBackClick}
        >
          Cancel
        </Button>
        <Box>
          {!isUpdateField && (
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
          )}
          <LoadingButton
            loading={isCreatingField || isUpdatingField || isBulkUpdating}
            onClick={handleSubmitForm}
            variant="contained"
          >
            Done
          </LoadingButton>
        </Box>
      </DialogActions>
    </>
  );
};
