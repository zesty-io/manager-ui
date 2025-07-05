import { IntegrationTypes, IntegrationKeyPaths } from "../../services/types";

export type FormTypes = "select" | "configure";

export type IntegrationRequestHeaders = {
  [key: string]: string;
};

export type IntegrationPropertyPaths = {
  rootPath: string;
  heading: string;
  subHeading?: string;
  thumbnail?: string;
  detail?: string;
  details?: {
    label: string;
    path: string;
  }[];
};

export type IntegrationFieldConfig = {
  requestHeaders?: IntegrationRequestHeaders;
  propertyPaths?: IntegrationPropertyPaths;
};

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
      details: [
        {
          label: "Position",
          path: "player.position",
        },
        {
          label: "Points",
          path: "player.stats.points",
        },
      ],
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

export const INITAL_PROPERTY_PATHS = {
  image: {
    heading: "",
    subHeading: "",
    thumbnail: "",
  },
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

const INTEGRATION_DATA1: any = {
  ZUID: "12-f8cfdcf2fa-5mlxxz",
  contentModelZUID: "6-92fda9baef-wx38b3",
  name: "integration_field",
  label: "Integration Field",
  description: "Display videos about places featured in the article",
  datatype: "integration",
  sort: 4,
  required: true,
  relationship: null,
  options: null,
  fieldOptions: null,
  datatypeOptions: null,
  integrationEndpoint:
    "http://8-f48cf3a682-7fthvk.manager.dev.zesty.io:8080/api/videos.json",
  integrationType: "image",
  integrationRequestHeaders: null,
  integrationKeyPaths: {
    heading: "name",
    subHeading: "shortDescription",
    thumbnail: "thumbnail",
    rootPath: "data.categoriesByCtx",
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

const INTEGRATION_DATA2: any = {
  ZUID: "12-f8cfdcf2fa-5mlxxz",
  contentModelZUID: "6-92fda9baef-wx38b3",
  name: "video_details",
  label: "Video Details",
  description: "Integration Field Video Details",
  datatype: "integration",
  sort: 4,
  required: true,
  relationship: null,
  options: null,
  fieldOptions: null,
  datatypeOptions: null,
  integrationEndpoint:
    "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=100&q=car%20videos&key=AIzaSyBoHf1I0mRlnLYkkxKYmokfr92NPzUL6NY",
  integrationType: "video",
  integrationRequestHeaders: null,
  integrationKeyPaths: {
    heading: "snippet.title",
    rootPath: "items",
    details: [
      {
        label: "Width",
        path: "snippet.thumbnails.default.width",
      },
      {
        label: "Height",
        path: "snippet.thumbnails.high.height",
      },
      {
        label: "Kind",
        path: "id.kind",
      },
      {
        label: "publishTime",
        path: "snippet.publishTime",
      },
    ],
  },
  settings: {
    defaultValue: null,
    list: true,
    minValue: 1,
    maxValue: 100,
  },
  createdAt: "2025-06-18T07:36:49Z",
  updatedAt: "2025-06-18T07:36:49Z",
  // deletedAt: null,
};

const INTEGRATION_VALUE1 = [
  {
    id: "https://rapidapi-prod-collections.s3.amazonaws.com/category/Cyber%20Security.svg.xml",
    name: "Cybersecurity",
    weight: 49,
    thumbnail:
      "https://rapidapi-prod-collections.s3.amazonaws.com/category/Cyber%20Security.svg.xml",
    shortDescription:
      "Cybersecurity APIs offer tools for developers to bolster the security of their applications and systems, including threat detection, authentication, encryption, and access control, guarding against cyber threats and attacks.",
    slugifiedName: "cybersecurity",
    color: "rgba(185,205,255,0.4)",
  },
  {
    id: "https://rapidapi-prod-collections.s3.amazonaws.com/category/Movies.svg.xml",
    name: "Movies",
    weight: 47,
    thumbnail:
      "https://rapidapi-prod-collections.s3.amazonaws.com/category/Movies.svg.xml",
    shortDescription:
      " Movie APIs connect applications or websites to servers housing movie-related information or files, enabling users to access various movie-related data and functionalities.",
    slugifiedName: "movies1",
    color: "rgba(107,184,255,0.4)",
  },
];

const INTEGRATION_VALUE2 = [
  {
    kind: "youtube#searchResult",
    etag: "0BD-nJjv3tpsBRQ--JNrjDVLFDA",
    id: {
      kind: "youtube#video",
      videoId: "gNmHDVPgaik",
    },
    snippet: {
      publishedAt: "2022-06-10T12:00:21Z",
      channelId: "UC7nok6hubrWbOEf52Tco6qg",
      title:
        "More than 50 Toy Cars Mini Car &amp; Big Mac Trailer | Car Videos For Kids",
      description:
        "I played with Cars miniature car and boxes, and a big Mac trailer. Enjoy the sounds of running, the sounds of nature, and the ...",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/gNmHDVPgaik/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/gNmHDVPgaik/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/gNmHDVPgaik/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "ToyToyPlay",
      liveBroadcastContent: "none",
      publishTime: "2022-06-10T12:00:21Z",
    },
  },
  {
    kind: "youtube#searchResult",
    etag: "HJ4egz64qq2kHd6Gmurr3m8c4VU",
    id: {
      kind: "youtube#video",
      videoId: "gpy5op7Pn-0",
    },
    snippet: {
      publishedAt: "2025-04-18T15:01:13Z",
      channelId: "UC4tR5ebD61VLm78f3XGUcWQ",
      title:
        "Amazing Collection of Miniature Cars #cars #automobile#diecast  #mercedes #jeep",
      description: "",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/gpy5op7Pn-0/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/gpy5op7Pn-0/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/gpy5op7Pn-0/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "Jo Collecting Cars",
      liveBroadcastContent: "none",
      publishTime: "2025-04-18T15:01:13Z",
    },
  },
];

const INTEGRATION_VALUE3 = [
  {
    kind: "youtube#searchResult",
    etag: "BPcftIzoCne-B5xL7SibmbHkOoY",
    id: {
      kind: "youtube#video",
      videoId: "IcvyW0wcXRg",
    },
    snippet: {
      publishedAt: "2019-10-04T10:30:00Z",
      channelId: "UCVEDZVtA5NUtjxSXHjtvkag",
      title: "Cars 3 Toys with Lightning McQueen for Kids",
      description:
        "Cars 3 Toys with Lightning McQueen for Kids. Hi Parents. This video is supposed to review and show the toys functions in an ...",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/IcvyW0wcXRg/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/IcvyW0wcXRg/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/IcvyW0wcXRg/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "Kidibli (Kinder Spielzeug Kanal)",
      liveBroadcastContent: "none",
      publishTime: "2019-10-04T10:30:00Z",
    },
    // _itemId: "cars-3-toys-with-lightning-mcqueen-for-kids",
  },
  {
    kind: "youtube#searchResult",
    etag: "UucGKlPOdH_bu5jQ3QsbyfUei0s",
    id: {
      kind: "youtube#video",
      videoId: "llAYUWXV7CI",
    },
    snippet: {
      publishedAt: "2024-10-04T06:29:24Z",
      channelId: "UCdziZq3v_hw6Iy0bhjmQ2qQ",
      title: "Mini Toyota RAV4 SUV | Off roading | Diecast Model Car Unboxing",
      description:
        "Unboxing a Mini Toyota RAV4 SUV Diecast Model Car. We also did extreme off roading with miniature Toyota RAV4 Diecast Car.",
      thumbnails: {
        default: {
          url: "https://i.ytimg.com/vi/llAYUWXV7CI/default.jpg",
          width: 120,
          height: 90,
        },
        medium: {
          url: "https://i.ytimg.com/vi/llAYUWXV7CI/mqdefault.jpg",
          width: 320,
          height: 180,
        },
        high: {
          url: "https://i.ytimg.com/vi/llAYUWXV7CI/hqdefault.jpg",
          width: 480,
          height: 360,
        },
      },
      channelTitle: "Miniature Automobiles",
      liveBroadcastContent: "none",
      publishTime: "2024-10-04T06:29:24Z",
    },
    // _itemId: "mini-toyota-rav4-suv-|-off-roading-|-diecast-model-car-unboxing",
  },
];

export const INTEGRATION_FIELD_DATA = INTEGRATION_DATA2;
export const INTEGRATION_FIELD_VALUE = INTEGRATION_VALUE3;
