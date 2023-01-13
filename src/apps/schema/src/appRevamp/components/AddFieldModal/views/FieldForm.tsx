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
} from "@mui/material";
import { snakeCase } from "lodash";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { FieldIcon } from "../../Field/FieldIcon";
import { stringStartsWithVowel } from "../../utils";
import { InputField, FieldFormInput } from "../FieldFormInput";
import { useCreateContentModelFieldMutation } from "../../../../../../../shell/services/instance";
import { ContentModelField } from "../../../../../../../shell/services/types";

const commonFields: InputField[] = [
  {
    name: "label",
    type: "input",
    label: "Label",
    required: true,
    errorMsg: "This field is required",
    fullWidth: true,
  },
  {
    name: "name",
    type: "input",
    label: "API / Parsley Code Reference",
    required: true,
    errorMsg: "This field is required",
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
interface FormData {
  [key: string]: string | boolean;
}
interface Props {
  type: string;
  name: string;
  onModalClose: () => void;
  onBackClick: () => void;
  fields: ContentModelField[];
}
export const FieldForm = ({
  type,
  name,
  onModalClose,
  onBackClick,
  fields,
}: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const params = useParams<Params>();
  const { id } = params;
  const [createContentModelField, { isLoading, isSuccess }] =
    useCreateContentModelFieldMutation();

  useEffect(() => {
    let formFields: { [key: string]: string | boolean } = {};

    // Set initial form data object
    formConfig[type].forEach(
      (field) =>
        (formFields[field.name] = field.type === "checkbox" ? false : "")
    );

    setFormData(formFields);
  }, [type]);

  const handleSubmitForm = () => {
    setIsSubmitClicked(true);

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
      sort: fields?.length, // Just use the length since sort starts at 0
    };

    createContentModelField({ modelZUID: id, body });
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
            <IconButton size="small" onClick={onBackClick}>
              <ArrowBackIcon />
            </IconButton>
            <Box px={1.5}>
              <FieldIcon
                type={type}
                height="28px"
                width="28px"
                fontSize="16px"
              />
            </Box>
            {headerText}
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
            {formConfig[type].map((fieldConfig, index) => (
              <FieldFormInput
                key={index}
                fieldConfig={fieldConfig}
                onDataChange={handleFieldDataChange}
                error={
                  isSubmitClicked &&
                  fieldConfig.required &&
                  !formData[fieldConfig.name]
                }
              />
            ))}
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
        <Button variant="outlined" color="inherit">
          Cancel
        </Button>
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
          <Button onClick={handleSubmitForm} variant="contained">
            Done
          </Button>
        </Box>
      </DialogActions>
    </>
  );
};
