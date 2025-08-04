import {
  IntegrationTypes,
  IntegrationKeyPaths,
  IntegrationFieldConfig,
} from "../../services/types";

export type FormTypes = "select" | "configure";

export type IntegrationDisplayProps = {
  [key: string]: string;
};

export type ApiResponse<T> = {
  status: "success" | "error";
  data?: T;
};

export type FieldTypeIntegrationProps = {
  name: string;
  label: string;
  description?: string;
  formType?: FormTypes;
  required?: boolean;
  value?: any | null;
  onChange?: (value: any) => void;
  error?: string | [string, string][] | null;
  integrationFieldConfig?: IntegrationFieldConfig | null;
  maxItems?: number | null;
  isLoading?: boolean;
  isUpdate?: boolean;
};

export type DisplayOptionCardProps = {
  title: string;
  description: string;
  type: IntegrationTypes;
  card: IntegrationKeyPaths;
  disabled?: boolean;
  disableMenu?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
};

type ConfigTypes = "option" | "text";

export type ConfigProps = {
  name: string;
  label: string;
  type: ConfigTypes;
  isRequired?: boolean;
  description?: string;
  placeholder?: string;
};

export const COLOR_MAP = {
  string: "green",
  object: "purple",
  array: "purple",
  number: "red",
  boolean: "blue",
  default: "grey",
  url: "pink",
};

export const GENERIC_DISPLAY_TYPES: DisplayOptionCardProps[] = [
  {
    title: "Text Card",
    description: "Display items with a heading and subheading",
    type: "text",
    card: {
      heading: "Chugging through Sri Lanka's tea plantations",
      subHeading: "The beautiful train from Kandy to Ella",
    },
  },
  {
    title: "Image Card",
    description: "Display items with an image, heading, and subheading.",
    type: "image",
    card: {
      heading: "Washington-state-mountain.jpg",
      subHeading: "A photo of a beautiful mountain in the state of Washington",
      thumbnail: "/images/integration-sample-image.png",
    },
  },
  {
    title: "Video Card",
    description: "Display Shopify product listings",
    type: "video",
    card: {
      heading: "Chugging through Sri Lanka's tea plantations",
      subHeading: "13:10",
      thumbnail: "/images/integration-sample-video.png",
    },
  },
  {
    title: "Details Card",
    description: "Display items with multiple details",
    type: "details",
    card: {
      heading: "Anfernee Simons",
      subHeading: "A photo of a beautiful mountain in the state of Washington",

      details: ["player.position", "player.stats.points"],
    },
  },
  {
    title: "Simple Card",
    description: "Display items with a heading and subheading",
    type: "simple",
    card: {
      heading: "Lebron James",
    },
  },
];

export const SPECIAL_DISPLAY_TYPES: DisplayOptionCardProps[] = [
  {
    title: "MUX Card",
    description: "Display videos from MUX",
    type: "mux",
    card: {
      heading: "HK01Bq7FrEQmIu3QpRiZZ98HQOOZjm6BYyg17eEunlyo",
      subHeading: "13:10",
      thumbnail: "/images/integration-sample-video.png",
    },
  },
  {
    title: "Youtube Card",
    description: "Display videos from Youtube",

    type: "youtube",
    card: {
      heading: "Chugging through Sri Lanka's tea plantations",
      subHeading: "13:10 • 92M views • 1 day ago",
      thumbnail: "/images/integration-sample-video.png",
    },
  },
  {
    title: "Shopify Card",
    description: "Display Shopify product listings",
    type: "shopify",
    card: {
      heading: "Basic Chair",
      subHeading: "Furniture",
      detail: "$73.00",
      thumbnail: "/images/integration-sample-image.png",
    },
  },
  {
    title: "Classy Card",
    description: "Display campaigns from classy",
    type: "classy",
    card: {
      heading: "Campaign Name",
      subHeading: "Campaign Description",
    },
  },
];

const HEADING: ConfigProps = {
  name: "heading",
  label: "Heading",
  type: "text",
  isRequired: true,
  placeholder: "Select",
};

const SUB_HEADING: ConfigProps = {
  name: "subHeading",
  label: "Sub Heading",
  type: "text",
  isRequired: true,
  placeholder: "Select",
};

const IMAGE: ConfigProps = {
  name: "thumbnail",
  label: "Thumbnail",
  type: "text",
  isRequired: true,
  placeholder: "Select",
  description: "Image will only render if value selected is a URL",
};

export const DISPLAY_OPTIONS_CONFIG: Record<string, ConfigProps[]> = {
  simple: [HEADING],
  text: [HEADING, SUB_HEADING],
  details: [
    HEADING,
    {
      name: "details",
      label: "Details",
      type: "option",
      isRequired: true,
      placeholder: "Select",
    },
  ],
  image: [HEADING, SUB_HEADING, IMAGE],
  video: [HEADING, SUB_HEADING, IMAGE],
  shopify: [
    HEADING,
    SUB_HEADING,
    IMAGE,
    {
      name: "detail",
      label: "Detail",
      type: "text",
      isRequired: true,
      placeholder: "Select",
    },
  ],
  youtube: [HEADING, SUB_HEADING, IMAGE],
  mux: [HEADING, SUB_HEADING, IMAGE],
  classy: [HEADING, SUB_HEADING],
};

export const LOADING_DATA = [...Array(10)].map((_, number) => ({
  id: number,
  name: String(number),
}));
