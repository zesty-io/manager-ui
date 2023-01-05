import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

import { Field } from "../Field";

interface FieldData {
  type: string;
  primaryText: string;
  secondaryText: string;
}
const fields: { [key: string]: FieldData[] } = {
  text: [
    {
      type: "text",
      primaryText: "Single Line Text",
      secondaryText: "Titles, names, and headings",
    },
    {
      type: "textarea",
      primaryText: "Multi Line Text",
      secondaryText: "Descriptions, summaries, and blurbs",
    },
    {
      // TODO: Change primaryText just need confirmation from Zosh
      type: "article_writer",
      primaryText: "Rich Text (Article Writer)",
      secondaryText: "Long text content with links & images such as blogs",
    },
    {
      // TODO: Change primaryText just need confirmation from Zosh
      type: "wysiwyg_basic",
      primaryText: "Rich Text (WYSIWYG)",
      secondaryText: "Long text content with links & images such as blogs",
    },
    {
      type: "markdown",
      primaryText: "Markdown",
      secondaryText: "Light weight markup to format text",
    },
  ],
  media: [
    {
      type: "images",
      primaryText: "Media",
      secondaryText: "Images, videos, PDFs, and other files",
    },
  ],
  relationship: [
    {
      type: "one_to_one",
      primaryText: "Single Item Relationship",
      secondaryText: "Link to one content item of a model",
    },
    {
      type: "one_to_many",
      primaryText: "Multi Item Relationship",
      secondaryText: "Link to multiple content items of a model",
    },
    {
      type: "link",
      primaryText: "External URL",
      secondaryText: "Link to an external website",
    },
    {
      type: "internal_link",
      primaryText: "Internal Link",
      secondaryText: "Link to an internal content item",
    },
  ],
  number: [
    {
      type: "number",
      primaryText: "Integer",
      secondaryText: "Whole numbers",
    },
  ],
  // TODO: Need to confirm with Zosh what the header title for this group is
  locale: [
    {
      type: "currency",
      primaryText: "Currency",
      secondaryText: "Perfect for product prices",
    },
    // TODO: Will probably need to move somewhere, need Zosh's verification as to where this will be
    {
      type: "uuid",
      primaryText: "UUID",
      secondaryText: "Lorem ipsum",
    },
  ],
  // TODO: Need to confirm with Zosh what the header title for this group is
  date: [
    {
      type: "date",
      primaryText: "Date",
      secondaryText: "Perfect for Birthdays, release dates, events, etc.",
    },
    {
      type: "datetime",
      primaryText: "Date & Time",
      secondaryText: "Track dates along with specific times",
    },
  ],
  // TODO: Need to confirm with Zosh what the header title for this group is
  other: [
    {
      type: "yes_no",
      primaryText: "Boolean",
      secondaryText: "True or false",
    },
    {
      type: "dropdown",
      primaryText: "Dropdown",
      secondaryText: "Select from a list of values",
    },
    {
      type: "color",
      primaryText: "Color",
      secondaryText: "Background colors, font colors, and more",
    },
    {
      type: "sort",
      primaryText: "Sort Order",
      secondaryText: "Add order to content items",
    },
  ],
};

interface Props {
  open: boolean;
  handleCloseModal: Dispatch<SetStateAction<boolean>>;
}
export const AddFieldModal = ({ open, handleCloseModal }: Props) => {
  const handleFieldClick = (fieldType: string) => {
    // Show appropriate field options
    console.log("Field clicked: ", fieldType);
  };

  return (
    <Dialog
      open={open}
      onClose={() => handleCloseModal(false)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        display="flex"
        sx={{
          justifyContent: "space-between",
          padding: 3,
        }}
      >
        Select a Field Type
        <IconButton onClick={() => handleCloseModal(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          "&.MuiDialogContent-dividers": {
            borderColor: "grey.100",
          },
          "& div.field-type-group:not(:last-of-type)": {
            borderBottom: "1px solid",
            borderColor: "border",
            mb: 2,
            pb: 2,
          },
        }}
      >
        <Box py={2} width="349px">
          <TextField
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {Object.keys(fields).map((fieldKey) => (
          <Box className="field-type-group" key={fieldKey}>
            <Typography component="p" variant="overline" mb={2}>
              {fieldKey}
            </Typography>
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr"
              rowGap={2}
              columnGap={2}
            >
              {fields[fieldKey].map((field: FieldData, index) => (
                <Field
                  key={index}
                  isDynamic={false}
                  primaryText={field.primaryText}
                  secondaryText={field.secondaryText}
                  fieldType={field.type}
                  onFieldClick={() => handleFieldClick(field.type)}
                />
              ))}
            </Box>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};
