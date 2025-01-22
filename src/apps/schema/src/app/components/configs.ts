import { InputField } from "./AddFieldModal/FieldFormInput";
import {
  ContentModelField,
  ContentModelFieldDataType,
  FieldSettings,
} from "../../../../../shell/services/types";

export type FieldType =
  | "text"
  | "textarea"
  | "wysiwyg_basic"
  | "markdown"
  | "images"
  | "one_to_one"
  | "one_to_many"
  | "link"
  | "internal_link"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "yes_no"
  | "dropdown"
  | "color"
  | "sort"
  | "uuid"
  | "files"
  | "fontawesome"
  | "wysiwyg_advanced"
  | "article_writer"
  | "block_selector"; // TODO: Will need to confirm if this type is already supported by the api
interface FieldListData {
  type: FieldType;
  name: string;
  shortDescription: string;
  description: string;
  commonUses: string[];
  proTip: string;
  subHeaderText: string;
}
interface FormConfig {
  details: InputField[];
  rules: InputField[];
}
type SystemField = Pick<ContentModelField, "label" | "datatype" | "name">;
const FIELD_COPY_CONFIG: { [key: string]: FieldListData[] } = {
  text: [
    {
      type: "text",
      name: "Single Line Text",
      shortDescription: "Titles, names, and headings",
      description:
        'The "Single Line Text" Field is best for short text content that doesn\'t need special formatting or have links or media.',
      commonUses: [
        "Article Titles",
        "Author Names",
        "Event Names",
        "Category Labels",
        "Headings",
      ],
      proTip:
        "This field works great when you want to ensure that contributors cannot apply any styling to text.",
      subHeaderText: "Used for Titles, names, and headings",
    },
    {
      type: "textarea",
      name: "Multi Line Text",
      shortDescription: "Descriptions, summaries, and blurbs",
      description:
        "The Multi Line Text field is best for long text content that doesn't need special formatting or have links or media.",
      commonUses: [
        "Sub Headings",
        "Article Summaries",
        "Product Descriptions",
        "Category Descriptions",
        "Author Bios",
      ],
      proTip:
        "This field works great when you want to ensure that contributors cannot apply any styling to text.",
      subHeaderText: "Used for descriptions, summaries, and blurbs",
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
      subHeaderText: "Long text content with links & images such as blogs",
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
      subHeaderText: "Light weight markup to format text",
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
      subHeaderText: "Use for images, videos, PDFs, and other files",
    },
  ],
  relationship: [
    {
      type: "one_to_one",
      name: "One to One Relationship",
      shortDescription: "Link to one content item of a model",
      description:
        "This field is perfect for connecting your model to another model. For example, linking a blog to a category or an author.",
      commonUses: [
        "To link an Article to a single Author or Category",
        "To link an Employee to a single service",
      ],
      proTip:
        "It's great to use this field when you find yourself or your team repeatedly typing in the same set of inputs such as author names. For example, it makes sense to create a model of Authors and connect to it since you will else have to else repeatedly type it in for each article.",
      subHeaderText: "Use this field to link to one content item of a model",
    },
    {
      type: "one_to_many",
      name: "One to Many Relationship",
      shortDescription: "Link to multiple content items of a model",
      description:
        "This field allows you to connect your model to another model and connect to multiple items instead of one.",
      commonUses: [
        "To link an Article to Multiple Authors, Tags, or Categories",
        "To link an Author to Multiple Services",
      ],
      proTip:
        "It's great to use this field when you find yourself or your team repeatedly typing in the same set of inputs such as author names. For example, it makes sense to create a model of Authors and connect to it since you will else have to else repeatedly type it in for each article.",
      subHeaderText:
        "Use this field to link to multiple content items of a model",
    },
    {
      type: "link",
      name: "External URL",
      shortDescription: "Link to an external website",
      description:
        "This field is great to store URLs to pages on external websites. These links can be displayed and clicked on by users.",
      commonUses: [
        "Link to affiliate sites (e.g. Amazon)",
        "Link to Social Media Pages on Facebook, Instagram, etc.",
        "Link to 3rd party services like Eventbrite for events or Doordash for Orders",
      ],
      proTip: "You can also add links in rich text fields.",
      subHeaderText: "Use this field to link to an external website",
    },
    {
      type: "internal_link",
      name: "Internal Link",
      shortDescription: "Link to an internal content item",
      description:
        "Internal Link fields allow for the selection of an internal instance item from any schema. This can be useful for providing authors the ability to relate an item across an instance.",
      commonUses: ["Link to Internal Products", "Link to Internal Articles"],
      proTip:
        "You can use External URL fields if you want to link to external websites.",
      subHeaderText: "Use this field to link to an internal content item",
    },
    {
      type: "block_selector",
      name: "Block Selector",
      shortDescription: "Link to a variant of a block model",
      description:
        "The Block Selector field allows a user to select a unique variant of any block model they would like to see rendered on their page.",
      commonUses: ["Footer Section", "Block at the end of article", "Forms"],
      proTip:
        "These are great to use when you want to use different end blocks at the end of different pages of the same model",
      subHeaderText: "Link to a variant of a block model",
    },
  ],
  numeric: [
    {
      type: "number",
      name: "Number",
      shortDescription: "Whole numbers and floats",
      description: "This field is for when you want the input to be a number.",
      commonUses: [
        "Quantity of Products in Inventory",
        "Rankings",
        "Ratings",
        "Weight",
        "Height",
      ],
      proTip: "Number fields can hold both whole numbers and decimals.",
      subHeaderText: "Used for quantity, age, ratings, etc.",
    },
    {
      type: "currency",
      name: "Currency",
      shortDescription: "Perfect for product prices",
      description:
        "This field is for when you want to store a cost, price, or account balance.",
      commonUses: [
        "Cost Price of a Product or Service",
        "Selling Price of a Product or Service",
      ],
      proTip:
        "Use currency fields instead of number fields if you want to store prices.",
      subHeaderText: "Used for storing costs, prices, and balances",
    },
  ],
  dateandtime: [
    {
      type: "date",
      name: "Date",
      shortDescription: "Perfect for Birthdays, release dates, events, etc.",
      description: `This field is for when you want the input to be a past, present, or future date. You can customize whether a user can enter a day, month, or year or all 3.

      Zesty automatically tracks dates and times for date created, date published, and date modified so no additional fields need to be created for these.`,
      commonUses: [
        "Birthdates",
        "Anniversaries",
        "Historical Dates",
        "Release Dates",
      ],
      proTip:
        "If you want to add a time to your date then use the date time field.",
      subHeaderText: "Use for birthdays, release dates, events, etc.",
    },
    {
      type: "datetime",
      name: "Date & Time",
      shortDescription: "Track dates along with specific times",
      description: `This field is for when you want the input to be a data and time. You can customize whether a user can enter a time, day, month, or year or all 4.

      Zesty automatically tracks dates and times for date created, date published, and date modified so no additional fields need to be created for these.`,
      commonUses: [
        "Event Start Times & End Times",
        "Shipment Time",
        "Deadlines",
      ],
      proTip: "If you want to only have a date then use the date field.",
      subHeaderText: "Use to track dates along with specific times",
    },
  ],
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
      subHeaderText: "Used to set true or false values",
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
      subHeaderText: "Used to allow a user to select from a list of values",
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
      subHeaderText: "Used for Background colors, font colors, and more",
    },
    {
      type: "sort",
      name: "Sort Order",
      shortDescription: "Add order to content items",
      description:
        "There may be times when you want to sort data, not by name or date, but by a user-defined custom order. In such a scenario, you can add a sort order field which allows you to specify the order number of each content item.",
      commonUses: [
        "Set the order of featured products",
        "Set the order of categories",
        "Set the order of videos of a course",
      ],
      proTip:
        "You can change the default sort number with the plus and minus buttons in the content item view, as well as in the table view.",
      subHeaderText: "Use to add order to content items",
    },
    {
      type: "uuid",
      name: "UUID",
      shortDescription: "Set unique ids to each content item",
      description:
        "The UUID field creates a unique alpha numeric string when an item is created. This is a helpful feature for analytics tracking, inventory management, user management, etc.",
      commonUses: ["Product ID", "Inventory ID", "Employee ID"],
      proTip: "UUID are always unique and are non editable.",
      subHeaderText: "Use to set unique ids to each content item",
    },
  ],
};

const TYPE_TEXT: Record<FieldType, string> = {
  article_writer: "Article Writer",
  color: "Color",
  currency: "Currency",
  date: "Date",
  datetime: "Date and Time",
  dropdown: "Dropdown",
  files: "Files",
  fontawesome: "Font Awesome",
  images: "Media",
  internal_link: "Internal Link",
  link: "External URL",
  markdown: "Markdown",
  number: "Number",
  one_to_many: "One to Many",
  one_to_one: "One to One",
  sort: "Sort Order",
  text: "Single Line Text",
  textarea: "Multi Line Text",
  uuid: "UUID",
  wysiwyg_advanced: "WYSIWYG (Advanced)",
  wysiwyg_basic: "WYSIWYG",
  yes_no: "Boolean",
  block_selector: "Block Selector",
};

const COMMON_FIELDS: InputField[] = [
  {
    name: "label",
    type: "input",
    label: "Display Label",
    required: true,
    fullWidth: true,
    maxLength: 200,
    gridSize: 12,
    tooltip: "The display name of the field seen in Schema.",
    validate: ["required", "length"],
    autoFocus: true,
  },
  {
    name: "name",
    type: "input",
    label: "API / Parsley Code ID",
    required: true,
    fullWidth: true,
    maxLength: 50,
    gridSize: 12,
    tooltip: "This will appear in the API Responses",
    validate: ["length", "required", "unique"],
  },
  {
    name: "tooltip",
    type: "input",
    label: "Tooltip",
    required: false,
    fullWidth: true,
    maxLength: 250,
    gridSize: 12,
    tooltip: "Tool tip displayed to content editors.",
    validate: ["length"],
  },
  {
    name: "description",
    type: "input",
    label: "Description",
    subLabel: "Appears below the label to help content-writers and API users",
    required: false,
    fullWidth: true,
    multiline: true,
    gridSize: 12,
    tooltip: "Perfect for giving instructions to content writers.",
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

const COMMON_RULES: InputField[] = [
  {
    name: "defaultValue",
    type: "input",
    label: "Default Value",
    required: false,
    gridSize: 12,
  },
];

const CHARACTER_LIMIT_RULES: InputField[] = [
  {
    name: "minCharLimit",
    type: "input",
    label: "Minimum character count (with spaces)",
    required: false,
    gridSize: 6,
  },
  {
    name: "maxCharLimit",
    type: "input",
    label: "Maximum character count (with spaces)",
    required: false,
    gridSize: 6,
  },
];

const REGEX_RULES: InputField[] = [
  {
    name: "regexMatchPattern",
    type: "input",
    label: "Regex Match Pattern",
    required: false,
    gridSize: 6,
  },
  {
    name: "regexMatchErrorMessage",
    type: "input",
    label: "Regex Match Error Message",
    required: false,
    gridSize: 6,
  },
  {
    name: "regexRestrictPattern",
    type: "input",
    label: "Regex Restrict Pattern",
    required: false,
    gridSize: 6,
  },
  {
    name: "regexRestrictErrorMessage",
    type: "input",
    label: "Regex Restrict Error Message",
    required: false,
    gridSize: 6,
  },
];

const INPUT_RANGE_RULES: InputField[] = [
  {
    name: "minValue",
    type: "input",
    label: "Minimum Value",
    required: false,
    gridSize: 6,
  },
  {
    name: "maxValue",
    type: "input",
    label: "Maximum Value",
    required: false,
    gridSize: 6,
  },
];

const FORM_CONFIG: Record<FieldType, FormConfig> = {
  article_writer: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  color: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  currency: {
    details: [
      {
        name: "currency",
        type: "autocomplete",
        label: "Currency",
        required: true,
        gridSize: 12,
        tooltip:
          "The selected currency code, symbol, and flag will be displayed for this field in the content item and can be accessed through the field settings via the API.",
        placeholder: "Select a Currency",
        autoFocus: true,
      },
      {
        ...COMMON_FIELDS[0],
        autoFocus: false,
      },
      ...COMMON_FIELDS.slice(1),
    ],
    rules: [...COMMON_RULES, ...INPUT_RANGE_RULES],
  },
  date: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  datetime: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  dropdown: {
    details: [
      ...COMMON_FIELDS.slice(0, 4),
      {
        name: "options",
        type: "options",
        label: "Dropdown Options",
        required: false,
        gridSize: 12,
        maxLength: 150,
        validate: ["length", "unique"],
      },
      ...COMMON_FIELDS.slice(4),
    ],
    rules: [...COMMON_RULES],
  },
  files: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_FIELDS],
  },
  fontawesome: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  images: {
    details: [...COMMON_FIELDS],
    rules: [
      {
        name: "limit",
        type: "input",
        label: "Media Item Limit",
        required: false,
        gridSize: 12,
        inputType: "number",
        tooltip: "Set the minimum media file limit to 1. It cannot go lower.",
      },
      {
        name: "group_id",
        type: "autocomplete",
        label: "Select Folder",
        required: false,
        gridSize: 12,
      },
      {
        name: "fileExtensions",
        type: "input",
        label: "File Extensions",
        required: false,
        gridSize: 12,
      },
      {
        name: "fileExtensionsErrorMessage",
        type: "input",
        label: "File extensions error message",
        required: false,
        gridSize: 12,
      },
      ...COMMON_RULES,
    ],
  },
  internal_link: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  link: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  markdown: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  number: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES, ...INPUT_RANGE_RULES],
  },
  one_to_many: {
    details: [
      {
        name: "relatedModelZUID",
        type: "autocomplete",
        label: "Reference Model",
        required: false,
        gridSize: 6,
        placeholder: "Select a model",
        autoFocus: true,
      },
      {
        name: "relatedFieldZUID",
        type: "autocomplete",
        label: "Field to Display",
        required: false,
        gridSize: 6,
        placeholder: "Select a field",
      },
      {
        ...COMMON_FIELDS[0],
        autoFocus: false,
      },
      ...COMMON_FIELDS.slice(1),
    ],
    rules: [...COMMON_RULES],
  },
  one_to_one: {
    details: [
      {
        name: "relatedModelZUID",
        type: "autocomplete",
        label: "Reference Model",
        required: false,
        gridSize: 6,
        placeholder: "Select a model",
        autoFocus: true,
      },
      {
        name: "relatedFieldZUID",
        type: "autocomplete",
        label: "Field to Display",
        required: false,
        gridSize: 6,
        placeholder: "Select a field",
      },
      {
        ...COMMON_FIELDS[0],
        autoFocus: false,
      },
      ...COMMON_FIELDS.slice(1),
    ],
    rules: [...COMMON_RULES],
  },
  sort: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  text: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES, ...CHARACTER_LIMIT_RULES, ...REGEX_RULES],
  },
  textarea: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES, ...CHARACTER_LIMIT_RULES, ...REGEX_RULES],
  },
  uuid: {
    details: [...COMMON_FIELDS],
    rules: [],
  },
  wysiwyg_advanced: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  wysiwyg_basic: {
    details: [...COMMON_FIELDS],
    rules: [...COMMON_RULES],
  },
  yes_no: {
    details: [
      ...COMMON_FIELDS.slice(0, 3),
      {
        name: "options",
        type: "toggle_options",
        label: "Boolean Options",
        required: false,
        gridSize: 12,
        maxLength: 150,
        validate: ["length"],
      },
      ...COMMON_FIELDS.slice(3),
    ],
    rules: [...COMMON_RULES],
  },
  block_selector: {
    details: [...COMMON_FIELDS],
    rules: [],
  },
};

const SYSTEM_FIELDS: readonly SystemField[] = [
  {
    label: "Item ZUID",
    datatype: "uuid",
    name: "ZUID",
  },
  {
    label: "Created At",
    datatype: "datetime",
    name: "createdAt",
  },
  {
    label: "Updated At",
    datatype: "datetime",
    name: "updatedAt",
  },
  {
    label: "Version",
    datatype: "number",
    name: "version",
  },
  {
    label: "Master ZUID",
    datatype: "uuid",
    name: "masterZUID",
  },
  {
    label: "Model ZUID",
    datatype: "uuid",
    name: "contentModelZUID",
  },
] as const;

const SEO_FIELDS: readonly SystemField[] = [
  {
    label: "SEO Meta Title",
    datatype: "text",
    name: "seo_meta_title",
  },
  {
    label: "SEO Meta Description",
    datatype: "textarea",
    name: "seo_meta_description",
  },
  {
    label: "SEO Meta Keywords",
    datatype: "textarea",
    name: "seo_meta_keywords",
  },
  {
    label: "SEO Link Title",
    datatype: "text",
    name: "seo_link_title",
  },
] as const;

type StarterBlockFieldProps = {
  label: string;
  name: string;
  description: string;
  datatype: ContentModelFieldDataType;
  settings: FieldSettings;
};

type StarterBlockProps = {
  label: string;
  image: string;
  name: string;
  description: string;
  fields: StarterBlockFieldProps[];
};

const STARTER_BLOCKS: StarterBlockProps[] = [
  {
    label: "Blank",
    image: "/images/block_blank.png",
    name: "blank",
    description: "A blank block",
    fields: [],
  },
  {
    label: "Side by Side Hero Image",
    image: "/images/block_hero_side_by_side_image.png",
    name: "side_by_side_hero_image",
    description:
      "A hero with text and CTA buttons on the left and an image on the right",
    fields: [
      {
        name: "title",
        label: "Title",
        description: "The primary heading displayed in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "Protect What Matters Most with ABC Insurance",
          list: true,
        },
      },
      {
        label: "Sub Title",
        name: "sub_title",
        description:
          "The supporting text displayed below the title in the left section.",
        datatype: "textarea",
        settings: {
          defaultValue:
            "Discover personalized insurance plans designed to secure your future and give you peace of mind.",
          list: true,
        },
      },
      {
        label: "CTA Button 1 Text",
        name: "cta_button_1_text",
        description:
          "The text for the first call-to-action button in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "Get a Quote.",
          list: true,
        },
      },
      {
        label: "CTA Button 1 URL",
        name: "cta_button_1_url",
        description: "The URL the first call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/get-a-quote",
          list: true,
        },
      },
      {
        label: "CTA Button 2 Text",
        name: "cta_button_2_text",
        description:
          "The text for the second call-to-action button in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "Learn More",
          list: true,
        },
      },
      {
        label: "CTA Button 2 URL",
        name: "cta_button_2_url",
        description: "The URL the second call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/learn-more",
          list: true,
        },
      },
      {
        label: "Button Container Sub Text",
        name: "button_container_sub_text",
        description:
          "Supporting text below the call-to-action buttons in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "No hidden fees, no obligations.",
          list: true,
        },
      },
      {
        label: "Hero Image",
        name: "hero_image",
        description:
          "The image displayed on the right side of the hero section.",
        datatype: "images",
        settings: {
          defaultValue:
            "Image of an insurance company or family https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          list: true,
        },
      },
      {
        label: "Star Rating Number",
        name: "star_rating_number",
        description: "A numerical rating displayed in the hero section.",
        datatype: "number",
        settings: {
          defaultValue: "4.8",
          list: true,
        },
      },
      {
        label: "Star Rating Title",
        name: "star_rating_title",
        description: "A title describing the star rating.",
        datatype: "text",
        settings: {
          defaultValue: "Customer Satisfaction",
          list: true,
        },
      },
      {
        label: "Star Rating Sub Text",
        name: "star_rating_sub_text",
        description: "Additional details about the star rating.",
        datatype: "text",
        settings: {
          defaultValue: "Rated by 5,000+ happy customers.",
          list: true,
        },
      },
    ],
  },
  {
    label: "Hero Image Below",
    name: "hero_image_below",
    description:
      "A hero with text and CTA buttons on the top and an image below",
    image: "/images/block_hero_image_below.png",
    fields: [
      {
        label: "Top CTA Button Text",
        name: "top_cta_button_text",
        description: "The text for the top call-to-action button.",
        datatype: "text",
        settings: {
          defaultValue: "Get Started",
          list: true,
        },
      },
      {
        label: "Top CTA Button URL",
        name: "top_cta_button_url",
        description: "The URL the top call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/get-started",
          list: true,
        },
      },
      {
        name: "title",
        label: "Title",
        description: "The primary heading displayed in the hero section.",
        datatype: "text",
        settings: {
          defaultValue: "Secure Your Future with ABC Insurance",
          list: true,
        },
      },
      {
        label: "Sub Title",
        name: "sub_title",
        description:
          "The supporting text displayed below the title in the hero section.",
        datatype: "textarea",
        settings: {
          defaultValue: "Affordable plans tailored to your needs.",
          list: true,
        },
      },
      {
        label: "CTA Button 1 Text",
        name: "cta_button_1_text",
        description: "The text for the first call-to-action button",
        datatype: "text",
        settings: {
          defaultValue: "Get a Quote.",
          list: true,
        },
      },
      {
        label: "CTA Button 1 URL",
        name: "cta_button_1_url",
        description: "The URL the first call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/get-a-quote",
          list: true,
        },
      },
      {
        label: "CTA Button 2 Text",
        name: "cta_button_2_text",
        description: "The text for the second call-to-action button.",
        datatype: "text",
        settings: {
          defaultValue: "Learn More",
          list: true,
        },
      },
      {
        label: "CTA Button 2 URL",
        name: "cta_button_2_url",
        description: "The URL the second call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/learn-more",
          list: true,
        },
      },
      {
        label: "Hero Image",
        name: "hero_image",
        description: "The image displayed in the hero section.",
        datatype: "images",
        settings: {
          defaultValue:
            "An image of an insurance company like this https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          list: true,
        },
      },
    ],
  },
  {
    label: "Contact Us Form",
    name: "contact_us_form",
    description: "",
    image: "/images/block_contact_us_form.png",
    fields: [
      {
        label: "Title",
        name: "title",
        description: "The main heading for the contact us form.",
        datatype: "text",
        settings: {
          defaultValue: "Get in Touch",
          list: true,
        },
      },
      {
        label: "Body Text",
        name: "body_text",
        description:
          "A detailed text providing context or instructions for the form.",
        datatype: "wysiwyg_basic",
        settings: {
          defaultValue:
            "Have questions? Reach out to us, and we’ll get back to you shortly.",
          list: true,
        },
      },
      {
        label: "Name",
        name: "name",
        description: "A label for the name input field.",
        datatype: "text",
        settings: {
          defaultValue: "Your Name",
          list: true,
        },
      },
      {
        label: "Person Name",
        name: "person_name",
        description: "The name of the primary contact person.",
        datatype: "text",
        settings: {
          defaultValue: "Sarah Johnson",
          list: true,
        },
      },
      {
        label: "Person Title",
        name: "person_title",
        description: "The title or role of the primary contact person.",
        datatype: "text",
        settings: {
          defaultValue: "Customer Support Specialist",
          list: true,
        },
      },
      {
        label: "Person Email",
        name: "person_email",
        description: "The email address of the primary contact person.",
        datatype: "text",
        settings: {
          defaultValue: "support@abcinsurance.com",
          list: true,
        },
      },
      {
        label: "Person Photo",
        name: "person_photo",
        description: "A photo of the primary contact person.",
        datatype: "images",
        settings: {
          defaultValue:
            "Photo of a Lady like this https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          list: true,
        },
      },
      {
        label: "Form Header Text",
        name: "form_header_text",
        description: "A subheading or introduction for the contact form.",
        datatype: "text",
        settings: {
          defaultValue: "We're here to help!",
          list: true,
        },
      },
      {
        label: "Form CTA Button Text",
        name: "form_cta_button_text",
        description: "The text for the call-to-action button on the form.",
        datatype: "text",
        settings: {
          defaultValue: "Submit",
          list: true,
        },
      },
    ],
  },
  {
    label: "Feature Side By Side Image",
    name: "feature_side_by_side_image",
    description: "A feature with text on the left and image on the right",
    image: "/images/block_feature_side_by_side_image.png",
    fields: [
      {
        label: "Feature Intro Text",
        name: "feature_intro_text",
        description: "A short introductory text for the feature section.",
        datatype: "text",
        settings: {
          defaultValue: "Discover our unique insurance features",
          list: true,
        },
      },
      {
        label: "Feature Intro Link",
        name: "feature_intro_link",
        description: "The URL linked to the introductory feature text.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/features",
          list: true,
        },
      },
      {
        label: "Title",
        name: "title",
        description: "The main heading for the feature section.",
        datatype: "text",
        settings: {
          defaultValue: "Comprehensive Coverage Plans",
          list: true,
        },
      },
      {
        label: "Sub Title",
        name: "sub_title",
        description:
          "The supporting text providing more detail about the feature.",
        datatype: "textarea",
        settings: {
          defaultValue:
            "Tailored insurance plans to fit your needs and budget, giving you complete peace of mind.",
          list: true,
        },
      },
      {
        label: "CTA Button Text",
        name: "cta_button_text",
        description:
          "The text for the call-to-action button in the feature section.",
        datatype: "text",
        settings: {
          defaultValue: "Learn About Features",
          list: true,
        },
      },
      {
        label: "CTA Button URL",
        name: "cta_button_url",
        description: "The URL the call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/learn-features",
          list: true,
        },
      },
      {
        label: "Hero Image",
        name: "hero_image",
        description: "The image displayed alongside the feature section.",
        datatype: "images",
        settings: {
          defaultValue:
            "Image of a person working with another person at a desk like this https://images.unsplash.com/photo-1573496267526-08a69e46a409?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          list: true,
        },
      },
    ],
  },
  {
    label: "Single Testimonial",
    name: "single_testimonial",
    description:
      "A single testimonial quote with a person's name, image, and company details",
    image: "/images/block_single_testimonial.png",
    fields: [
      {
        label: "Quote",
        name: "quote",
        description: "The testimonial or quote provided by a person.",
        datatype: "textarea",
        settings: {
          defaultValue:
            "ABC Insurance has transformed my life with its reliable and affordable plans.",
          list: true,
        },
      },
      {
        label: "Person Image",
        name: "person_image",
        description: "The image of the person providing the quote.",
        datatype: "images",
        settings: {
          defaultValue:
            "Image of a Person like this https://images.unsplash.com/photo-1717533564570-4ea91a5df160?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          list: true,
        },
      },
      {
        label: "Person Name",
        name: "person_name",
        description: "The name of the person providing the quote.",
        datatype: "text",
        settings: {
          defaultValue: "John Doe",
          list: true,
        },
      },
      {
        label: "Job Title",
        name: "job_title",
        description: "The job title of the person providing the quote.",
        datatype: "text",
        settings: {
          defaultValue: "Financial Advisor",
          list: true,
        },
      },
      {
        label: "Position",
        name: "position",
        description: "The person's position in their company.",
        datatype: "text",
        settings: {
          defaultValue: "Senior Manager",
          list: true,
        },
      },
      {
        label: "Company Name",
        name: "company_name",
        description: "The name of the company the person represents.",
        datatype: "text",
        settings: {
          defaultValue: "ABC Insurance",
          list: true,
        },
      },
      {
        label: "Company Logo",
        name: "company_logo",
        description: "The logo of the company the person represents.",
        datatype: "images",
        settings: {
          defaultValue: "Stock Company Logo... could use the Zesty Logo",
          list: true,
        },
      },
    ],
  },
];

export {
  FieldListData,
  FIELD_COPY_CONFIG,
  TYPE_TEXT,
  FORM_CONFIG,
  SYSTEM_FIELDS,
  SystemField,
  SEO_FIELDS,
  StarterBlockFieldProps,
  StarterBlockProps,
  STARTER_BLOCKS,
};
