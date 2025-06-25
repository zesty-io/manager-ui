export type IntegrationTypes =
  | "simple"
  | "text"
  | "details"
  | "image"
  | "video"
  | "shopify"
  | "youtube"
  | "mux"
  | "classy";

export type FormTypes = "select" | "configure";

export type IntegrationFieldDisplay = {
  ZUID: string;
  name: string;
  label: string;
  description?: string;

  integrationEndpoint: string;
  integrationType: IntegrationTypes;
  title: string;

  items: IntegrationPropertyPath[];
};

export type IntegrationPropertyPath = {
  rootPath?: string;
  heading: string;
  subHeading?: string;
  detail?: string;
  thumbnail?: string;
  details?: {
    label: string;
    path: string;
  }[];
};

export type APIHeader = {
  key: string;
  value?: string;
};

export type DataKeys = {
  dataList: string;
  heading: string;
  subHeading: string;
  detail: string;
  image: string;
  details: string;
};

export type DisplayPath = {
  dataPath: string;
  heading: string;
  subHeading: string;
  detail: string;
  image: string;
  details?: string[];
};
export const DEFAULT_DATA_KEYS = {
  heading: "",
  subHeading: "",
  detail: "",
  thumbnail: "",
  details: "",
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

export type IntegrationFieldConfig = {
  integrationEndPoint: string | null;
  integrationType: IntegrationTypes | null;
  integrationHeaders?: APIHeader[] | null;
};

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

export const DEFAULT_HEADERS = [
  {
    key: "",
    value: "",
  },
  {
    key: "",
    value: "",
  },
  {
    key: "",
    value: "",
  },
  {
    key: "",
    value: "",
  },
  {
    key: "",
    value: "",
  },
];

export const COLOR_MAP = {
  string: "green",
  object: "purple",
  array: "purple",
  number: "red",
  boolean: "blue",
  default: "grey",
  url: "pink",
};

// export const CHIP_COLOR_MAP = {
//   string: { color: "green.600", bgcolor: "green.50" },
//   object: { color: "purple.600", bgcolor: "purple.50" },
//   array: { color: "purple.600", bgcolor: "purple.50" },
//   number: { color: "red.600", bgcolor: "red.50" },
//   boolean: { color: "blue.600", bgcolor: "blue.50" },
//   default: { color: "gray.600", bgcolor: "gray.50" },
// };
