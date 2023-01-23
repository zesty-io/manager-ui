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
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { isEmpty } from "lodash";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { FieldIcon } from "../../Field/FieldIcon";
import { stringStartsWithVowel, convertLabelValue } from "../../utils";
import { InputField, FieldFormInput } from "../FieldFormInput";
import {
  useCreateContentModelFieldMutation,
  useUpdateContentModelFieldMutation,
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
  },
  {
    name: "name",
    type: "input",
    label: "API / Parsley Code Reference",
    required: true,
    fullWidth: true,
  },
  {
    name: "description",
    type: "input",
    label: "Description (optional)",
    subLabel: "Appears below the label to help content-writers and API users",
    required: false,
    fullWidth: true,
    multiline: true,
  },
  {
    name: "required",
    type: "checkbox",
    label: "Required field",
    subLabel: "Ensures an item cannot be created if field is empty",
    required: false,
  },
  {
    name: "list",
    type: "checkbox",
    label: "Add as column in table listing",
    subLabel: "Shows field as a column in the table in the content view",
    required: false,
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
  one_to_many: [],
  one_to_one: [],
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
}
export const FieldForm = ({
  type,
  name,
  onModalClose,
  onBackClick,
  fields,
  fieldData,
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
  const isUpdateField = !isEmpty(fieldData);

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
    if (isFieldCreated || isFieldUpdated) {
      if (isAddAnotherFieldClicked) {
        // When field is successfully created, re-route the user back to the field selection screen
        setIsAddAnotherFieldClicked(false);
        onBackClick();
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
        // Special validation for "name"
        if (inputName === "name") {
          // Validate if "name" has a value
          if (isEmpty(formData.name)) {
            newErrorsObj.name = "This field is required";
          } else {
            if (isUpdateField) {
              // Validate if "name" already exists during field update, but here it is ok to re-use its current name
              newErrorsObj.name =
                currFieldNames.includes(formData.name as string) &&
                formData.name !== fieldData.name
                  ? "Field name already exists"
                  : "";
            } else {
              // Validate if "name" already exists during create new field
              newErrorsObj.name = currFieldNames.includes(
                formData.name as string
              )
                ? "Field name already exists"
                : "";
            }
          }
        } else {
          // All other input validation
          newErrorsObj[inputName] = isEmpty(formData[inputName])
            ? "This field is required"
            : "";
        }
      }
    });

    setErrors(newErrorsObj);
  }, [formData]);

  const handleSubmitForm = () => {
    setIsSubmitClicked(true);
    const hasErrors = Object.values(errors).some((error) => error.length);

    if (hasErrors) {
      return;
    }

    const body: Omit<
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
      sort: isUpdateField ? fieldData.sort : fields?.length, // Just use the length since sort starts at 0
    };

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
      createContentModelField({ modelZUID: id, body });
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
          <>
            {formConfig[type]?.map((fieldConfig, index) => {
              return (
                <FieldFormInput
                  key={index}
                  fieldConfig={fieldConfig}
                  onDataChange={handleFieldDataChange}
                  errorMsg={isSubmitClicked && errors[fieldConfig.name]}
                  prefillData={formData[fieldConfig.name]}
                />
              );
            })}
          </>
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
              loading={isCreatingField}
              onClick={handleAddAnotherField}
            >
              Add another field
            </LoadingButton>
          )}
          <LoadingButton
            loading={isCreatingField || isUpdatingField}
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
