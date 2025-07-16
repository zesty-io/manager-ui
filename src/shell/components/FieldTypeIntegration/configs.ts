import { IntegrationTypes, IntegrationKeyPaths } from "../../services/types";

export type FormTypes = "select" | "configure";

export type IntegrationDisplayProps = {
  [key: string]: string;
};

export type ApiResponse<T> = {
  status: "success" | "error";
  data?: T;
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

const DATA_1: any = {
  ZUID: "12-f8cfdcf2fa-5mlxxz",
  contentModelZUID: "6-92fda9baef-wx38b3",
  name: "integration_generic",
  label: "Integration Generic",
  description: "Integration Test Generic API",
  datatype: "integration",
  sort: 4,
  required: true,
  relationship: null,
  options: null,
  fieldOptions: null,
  datatypeOptions: null,
  integrationFieldApiConfig: {
    endpoint: "https://8xbq19z1-dev.preview.stage.zesty.io/api/generic.json",
    headers: null,
  },
  integrationFieldDisplay: {
    type: "image",
    keyPaths: {
      heading: "name",
      subHeading: "team",
      thumbnail: "playerImage",
      rootPath: null,
    },
  },
  settings: {
    defaultValue: null,
    list: true,
    minValue: 1,
    maxValue: 20,
  },
  createdAt: "2025-06-18T07:36:49Z",
  updatedAt: "2025-06-18T07:36:49Z",
  // deletedAt: null,
};

export const DATA_2: any = {
  ZUID: "12-f8cfdcf2fa-5mlxxz",
  contentModelZUID: "6-92fda9baef-wx38b3",
  name: "integration_test_api",
  label: "Integration Test API",
  description: "Integration Test API Description",
  datatype: "integration",
  sort: 4,
  required: true,
  relationship: null,
  options: null,
  fieldOptions: null,
  datatypeOptions: null,
  integrationFieldApiConfig: {
    endpoint: "https://8xbq19z1-dev.preview.stage.zesty.io/api/mux.json",
    headers: null,
  },
  integrationFieldDisplay: {
    type: "mux",
    keyPaths: {
      heading: "title",
      subHeading: "colour",
      thumbnail: "media[0].src",
      detail: "lowestPrice",
      rootPath: "results[0].hits",
    },
  },
  settings: {
    defaultValue: null,
    list: true,
    minValue: 1,
    maxValue: 20,
  },
  createdAt: "2025-06-18T07:36:49Z",
  updatedAt: "2025-06-18T07:36:49Z",
  // deletedAt: null,
};

const DATA_3: any = {
  ZUID: "12-f8cfdcf2fa-5mlxxz",
  contentModelZUID: "6-92fda9baef-wx38b3",
  name: "integration_test_api",
  label: "Integration Test API",
  description: "Integration Test API Description",
  datatype: "integration",
  sort: 4,
  required: true,
  relationship: null,
  options: null,
  fieldOptions: null,
  datatypeOptions: null,
  integrationFieldApiConfig: {
    endpoint: "https://8xbq19z1-dev.preview.stage.zesty.io/api/mux.json",
    headers: null,
  },
  integrationFieldDisplay: {
    type: "image",
    keyPaths: {
      heading: "title",
      subHeading: "type",
      thumbnail: "media[2].src",
      rootPath: "results[0].hits",
    },
  },
  settings: {
    defaultValue: null,
    list: true,
    minValue: 1,
    maxValue: 5,
  },
  createdAt: "2025-06-18T07:36:49Z",
  updatedAt: "2025-06-18T07:36:49Z",
  // deletedAt: null,
};

const DATA_4: any = {
  ZUID: "12-f8cfdcf2fa-5mlxxz",
  contentModelZUID: "6-92fda9baef-wx38b3",
  name: "mux_integration",
  label: "MUX Integration",
  description: "MUX Integration Description",
  datatype: "integration",
  sort: 4,
  required: true,
  relationship: null,
  options: null,
  fieldOptions: null,
  datatypeOptions: null,
  integrationFieldApiConfig: {
    endpoint: "https://8xbq19z1-dev.preview.stage.zesty.io/api/mux.json",
    headers: null,
  },
  integrationFieldDisplay: {
    type: "mux",
    keyPaths: {
      heading: "title",
      subHeading: "color",
      thumbnail: "featuredMedia",
      rootPath: "results",
    },
  },
  settings: {
    defaultValue: null,
    list: true,
    minValue: 1,
    maxValue: 5,
  },
  createdAt: "2025-06-18T07:36:49Z",
  updatedAt: "2025-06-18T07:36:49Z",
  // deletedAt: null,
};

const VALUE_1 = [
  {
    playerId: "1630173",
    name: "Precious Achiuwa",
    team: "New York - Knicks (NYK)",
    jerseyNo: "5",
    position: "F",
    height: "2.03",
    weight: "110.2 kg",
    playerImage: "https://cdn.nba.com/headshots/nba/latest/260x190/1630173.png",
  },
  {
    playerId: "203500",
    name: "Steven Adams",
    team: "Houston - Rockets (HOU)",
    jerseyNo: "12",
    position: "C",
    height: "2.11",
    weight: "120.2 kg",
    playerImage: "https://cdn.nba.com/headshots/nba/latest/260x190/203500.png",
  },
  {
    playerId: "1628389",
    name: "Bam Adebayo",
    team: "Miami - Heat (MIA)",
    jerseyNo: "13",
    position: "C-F",
    height: "2.06",
    weight: "115.7 kg",
    playerImage: "https://cdn.nba.com/headshots/nba/latest/260x190/1628389.png",
  },
];

const VALUE_2 = [
  {
    id: 6805972385994,
    sku: "A5A9T",
    title: "Crest Oversized Zip Up Hoodie",
    type: "Mens Pullovers",
    color: "Lifestyle Brown",
    inStock: true,
    price: "$48",
    featuredMedia:
      "https://cdn.shopify.com/s/files/1/0156/6146/files/images-CrestOversizedZipUpHoodieGSLifestyleBrownA5A9T_NC0S_2349_0292.jpg?v=1746438153",
    rating: {
      average: 4.5088,
      range: 5,
      count: 57,
    },
    _itemId:
      "crestoversizedzipuphoodielifestylebrownhttpscdn.shopify.comsfiles101566146filesimages-crestoversizedzipuphoodiegslifestylebrowna5a9t_nc0s_2349_0292.jpgv1746438153",
  },
  {
    id: 6806002139338,
    sku: "A2C1B",
    title: "Arrival Track Jacket",
    type: "Mens Jackets / Outerwear",
    color: "Black",
    inStock: true,
    price: "$56",
    featuredMedia:
      "https://cdn.shopify.com/s/files/1/0156/6146/files/images-ArrivalWovenTrackJacketGSBlackA2C1B_BB2J_1125_A_A_0207.jpg?v=1746708605",
    rating: {
      range: 5,
    },
    _itemId:
      "arrivaltrackjacketblackhttpscdn.shopify.comsfiles101566146filesimages-arrivalwoventrackjacketgsblacka2c1b_bb2j_1125_a_a_0207.jpgv1746708605",
  },
  {
    id: 6805235728586,
    sku: "A4A7J",
    title: "Heritage Washed Hoodie",
    type: "Mens Hoodie",
    color: "Onyx Grey",
    inStock: true,
    price: "$44.8",
    featuredMedia:
      "https://cdn.shopify.com/s/files/1/0156/6146/files/HeritageWashedHoodieGSOnyxGrey-ACIDWASHSMALLBALLA4A7J-GB8N-1430.jpg?v=1695912174",
    rating: {
      average: 4.4779,
      range: 5,
      count: 272,
    },
    _itemId:
      "heritagewashedhoodieonyxgreyhttpscdn.shopify.comsfiles101566146filesheritagewashedhoodiegsonyxgrey-acidwashsmallballa4a7j-gb8n-1430.jpgv1695912174",
  },
];

export const INTEGRATION_DATA: any = DATA_1;
export const INTEGRATION_VALUE: any = VALUE_1;
