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
import { snakeCase, isEmpty } from "lodash";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { FieldIcon } from "../../Field/FieldIcon";
import { stringStartsWithVowel } from "../../utils";
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
  markdown: [],
  number: [],
  one_to_many: [],
  one_to_one: [],
  sort: [],
  text: [...commonFields],
  textarea: [],
  uuid: [],
  wysiwyg_basic: [],
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
  onFieldCreationSuccesssful: () => void;
  fieldData?: ContentModelField;
  isLoading?: boolean;
}
export const FieldForm = ({
  type,
  name,
  onModalClose,
  onBackClick,
  fields,
  onFieldCreationSuccesssful,
  fieldData,
  isLoading = false,
}: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
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
    // TODO: Field creation flow is not yet completed, closing modal on success for now
    if (isFieldCreated || isFieldUpdated) {
      onFieldCreationSuccesssful();
    }
  }, [isFieldCreated, isFieldUpdated]);

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
      name: snakeCase(formData.name as string),
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
    name,
    value,
  }: {
    name: string;
    value: string | boolean;
  }) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    const currFieldNames = fields.map((field) => field.name);
    let errorMsg = value ? "" : "This field is required";

    if (value && name === "name") {
      if (isUpdateField) {
        // Re-using its original name is fine when updating a field
        errorMsg =
          currFieldNames.includes(value as string) && value !== fieldData.name
            ? "Field name already exists"
            : "";
      } else {
        errorMsg = currFieldNames.includes(value as string)
          ? "Field name already exists"
          : "";
      }
    }

    if (name in errors) {
      setErrors((prevData) => ({
        ...prevData,
        [name]: errorMsg,
      }));
    }
  };

  const headerText = stringStartsWithVowel(name)
    ? `Add an ${name} Field`
    : `Add a ${name} Field`;

  if (isLoading) {
    // TODO: Verify with Zosh what will be shown here. Just showing a skeleton for now.
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

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
            {formConfig[type].map((fieldConfig, index) => {
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
        {/* TODO: Add functionality for button once complete flow is provided */}
        <Button variant="outlined" color="inherit">
          Cancel
        </Button>
        {/* TODO: Add functionality for button once complete flow is provided */}
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            sx={{
              mr: 2,
            }}
          >
            Add another field
          </Button>
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
