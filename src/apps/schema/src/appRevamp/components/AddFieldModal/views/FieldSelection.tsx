import { useState } from "react";
import {
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { FieldItem } from "../FieldItem";

interface FieldData {
  type: string;
  name: string;
  shortDescription: string;
  description: string;
  commonUses: string[];
  proTip: string;
}
const fields_config: { [key: string]: FieldData[] } = {
  text: [
    {
      type: "text",
      name: "Single Line Text",
      shortDescription: "Titles, names, and headings",
      description:
        "This field is best for short text content that doesn't need special formatting or have links or media.",
      commonUses: [
        "Article Titles",
        "Author Names",
        "Event Names",
        "Category Labels",
        "Headings",
      ],
      proTip:
        "This field works great when you want to ensure that contributors cannot apply any styling to text.",
    },
    {
      type: "textarea",
      name: "Multi Line Text",
      shortDescription: "Descriptions, summaries, and blurbs",
      description:
        "This field is best for long text content that doesn't need special formatting or have links or media.",
      commonUses: [
        "Sub Headings",
        "Article Summaries",
        "Product Descriptions",
        "Category Descriptions",
        "Author Bios",
      ],
      proTip:
        "This field works great when you want to ensure that contributors cannot apply any styling to text.",
    },
    {
      type: "wysiwyg_basic",
      name: "WYSIWYG",
      shortDescription: "Long text content with links & images such as blogs",
      description:
        "This field is best for long text content that has multiple headings, paragraphs, and in-line media such as videos, images, or links. You can also apply advanced text formatting such as bold, italics, and underline.",
      commonUses: [
        "Blog Posts",
        "Articles",
        "Guides",
        "Lists",
        "Event Descriptions",
      ],
      proTip:
        "This field works great when you want to contributors to apply any styling and structure to text.",
    },
    {
      type: "markdown",
      name: "Markdown",
      shortDescription: "Light weight markup to format text",
      description:
        "This field provides a contributor a Github Flavored Markdown editor syntax for styling and structuring content.",
      commonUses: [
        "Blog Posts",
        "Articles",
        "Guides",
        "Lists",
        "Event Descriptions",
      ],
      proTip:
        "This field works great when you want to contributors to apply any styling and structure to text.",
    },
  ],
  media: [
    {
      type: "images",
      name: "Media",
      shortDescription: "Images, videos, PDFs, and other files",
      description:
        "This field allows a user to add one or more media files such as an image, video, document, presentation, etc. You can set the maximum number of files a user can upload and the maximum file size for each upload.",
      commonUses: [
        "Article Cover Images",
        "Profile Pictures of Authors or Team Members",
        "Product Galleries",
        "Illustrations and Icons",
        "Videos of demos, tutorials, company onboarding",
        "Background Images",
        "PDFs of whitepapers, ebooks, menus, maps, and more",
        "Powerpoint Presentations",
      ],
      proTip: "You can also add media in-line in rich text fields.",
    },
  ],
  relationship: [
    {
      type: "one_to_one",
      name: "Single Item Relationship",
      shortDescription: "Link to one content item of a model",
      description:
        "This field is perfect for connecting your model to another model. For example, linking a blog to a category or an author.",
      commonUses: [
        "To connect your Article to a single Author or Category",
        "To connect your Author to a single Service",
      ],
      proTip:
        "It's great to use this field when you find yourself or your team repeatedly typing in the same set of inputs such as author names. For example, it makes sense to create a model of Authors and connect to it since you will else have to else repeatedly type it in for each article.",
    },
    {
      type: "one_to_many",
      name: "Multi Item Relationship",
      shortDescription: "Link to multiple content items of a model",
      description:
        "This field allows you to connect your model to another model and connect to multiple items instead of one.",
      commonUses: [
        "To connect your Article to a Multiple Authors, Tags, or Categories",
        "To connect your Author to a Multiple Services",
      ],
      proTip:
        "It's great to use this field when you find yourself or your team repeatedly typing in the same set of inputs such as author names. For example, it makes sense to create a model of Authors and connect to it since you will else have to else repeatedly type it in for each article.",
    },
    {
      type: "link",
      name: "External URL",
      shortDescription: "Link to an external website",
      description:
        "This field is great to store URLs to pages on external websites. These links can be displayed and clicked on by users.",
      commonUses: [
        "Link to Social Media Pages on Facebook, Instagram, etc.",
        "Link to 3rd party services like Eventbrite for events or Doordash for Orders",
      ],
      proTip: "You can also add links in rich text fields.",
    },
    {
      type: "internal_link",
      name: "Internal Link",
      shortDescription: "Link to an internal content item",
      //TODO: Details pending c/o Zosh
      description: "Lorem ipsum sit",
      commonUses: ["test", "test"],
      proTip: "Lorem ipsum sit dolor",
    },
  ],
  numeric: [
    {
      type: "number",
      name: "Integer",
      shortDescription: "Whole numbers",
      description:
        "This field is for when you want the input to be a whole number (aka a number with no decimals).",
      commonUses: ["Quantity of Products in Inventory", "Rankings", "Ratings"],
      proTip: "If you want your numbers with decimals use a float field.",
    },
    {
      type: "currency",
      name: "Currency",
      shortDescription: "Perfect for product prices",
      // TODO: Details pending c/o Zosh
      description: "Lorem ipsum dolor sit amet.",
      commonUses: ["test", "test"],
      proTip:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae, quas.",
    },
  ],
  // TODO: Zosh to provide correct Group Header Text
  dateandtime: [
    {
      type: "date",
      name: "Date",
      shortDescription: "Perfect for Birthdays, release dates, events, etc.",
      description: `This field is for when you want the input to be a past, present, or future date. You can customize whether a user can enter a day, month, or year or all 3.
        \n\nZesty automatically tracks dates and times for date created, date published, and date modified so no additional fields need to be created for these.`,
      commonUses: [
        "Birthdates",
        "Anniversaries",
        "Historical Dates",
        "Release Dates",
      ],
      proTip:
        "If you want to add a time to your date then use the date time field.",
    },
    {
      type: "datetime",
      name: "Date & Time",
      shortDescription: "Track dates along with specific times",
      description: `This field is for when you want the input to be a data and time. You can customize whether a user can enter a time, day, month, or year or all 4.
        \n\nZesty automatically tracks dates and times for date created, date published, and date modified so no additional fields need to be created for these.`,
      commonUses: [
        "Event Start Times & End Times",
        "Shipment Time",
        "Deadlines",
      ],
      proTip: "If you want to only have a date then use the date field.",
    },
  ],
  // TODO: Zosh to provide correct Group Header Text
  options: [
    {
      type: "yes_no",
      name: "Boolean",
      shortDescription: "True or false",
      description:
        "This field is for when you want a field to only have two possible values. E.g. yes or no, true or false, featured or not featured, etc.",
      commonUses: [
        "To callout featured blog posts, products",
        "Discounts in e-commerce products",
        "To callout Badges such as “Pro Author”",
        "To hide items",
      ],
      proTip:
        "Use boolean fields to filter out items you want to show in a collection of items.",
    },
    {
      type: "dropdown",
      name: "Dropdown",
      shortDescription: "Select from a list of values",
      description:
        "This field is for when you want a user to choose a value from a dropdown menu of pre-defined options written by you. You can define these values in the field settings.",
      commonUses: [
        "Genders",
        "Predefined Sizes",
        "Languages",
        "Company Departments",
      ],
      proTip:
        "The values you add to a dropdown field will only be available to the model the field is added into. If you need values that reusable and accessible in multiple models, create a separate model for it and then a single or multi item relationship field to it.",
    },
    {
      type: "color",
      name: "Color",
      shortDescription: "Background colors, font colors, and more",
      description:
        "This field is perfect for when you want to style different elements on your page such as background colors, text colors, borders, etc. Contributors will be given a color picker to select a color of their choice.",
      commonUses: [
        "Background Colors",
        "Border Colors",
        "Font Colors",
        "Change Colors of Category Tags",
      ],
      proTip:
        "Color pickers can be used to call out items in a unique way and allow a user to easily differentiate between items.",
    },
    {
      type: "sort",
      name: "Sort Order",
      shortDescription: "Add order to content items",
      // TODO: Details pending c/o Zosh
      description: "Lorem ipsum dolor sit amet consectetur adipisicing.",
      commonUses: ["test", "test"],
      proTip: "Lorem, ipsum.",
    },
    {
      type: "uuid",
      name: "UUID",
      // TODO: Details pending c/o Zosh
      shortDescription: "Lorem ipsum",
      description: "Lorem",
      commonUses: ["test", "test"],
      proTip: "Lorem ipsum",
    },
  ],
};

interface Props {
  onFieldClick: (fieldType: string, fieldName: string) => void;
  onModalClose: () => void;
}
export const FieldSelection = ({ onFieldClick, onModalClose }: Props) => {
  const [fieldTypes, setFieldTypes] = useState(fields_config);

  const handleFilterFields = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value.toLowerCase();
    let filteredFields: { [key: string]: FieldData[] } = {};

    Object.keys(fields_config).forEach((category) => {
      const matchedFields = fields_config[category].filter((field) => {
        const name = field.name.toLowerCase();

        if (name.includes(userInput)) {
          return field;
        }
      });

      if (matchedFields.length) {
        filteredFields[category] = matchedFields;
      }
    });

    setFieldTypes(filteredFields);
  };

  return (
    <>
      <DialogTitle
        display="flex"
        sx={{
          justifyContent: "space-between",
          padding: 3,
        }}
      >
        Select a Field Type
        <IconButton size="small" onClick={onModalClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          px: 3,
          pb: 3,
          "&.MuiDialogContent-dividers": {
            borderColor: "border",
          },
          "& div.field-type-group:not(:last-of-type)": {
            mb: 1.5,
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
            onChange={handleFilterFields}
          />
        </Box>
        {!Object.keys(fieldTypes).length && (
          <Typography>No matches found.</Typography>
        )}
        {Object.keys(fieldTypes).map((fieldKey) => (
          <Box className="field-type-group" key={fieldKey}>
            <Typography component="p" variant="overline" mb={1.5}>
              {fieldKey === "dateandtime" ? "Date & Time" : fieldKey}
            </Typography>
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr"
              rowGap={1.5}
              columnGap={2}
            >
              {fieldTypes[fieldKey].map((field: FieldData, index) => (
                <FieldItem
                  key={index}
                  fieldName={field.name}
                  shortDescription={field.shortDescription}
                  fieldType={field.type}
                  description={field.description}
                  commonUses={field.commonUses}
                  proTip={field.proTip}
                  onFieldClick={() => onFieldClick(field.type, field.name)}
                />
              ))}
            </Box>
          </Box>
        ))}
      </DialogContent>
    </>
  );
};
