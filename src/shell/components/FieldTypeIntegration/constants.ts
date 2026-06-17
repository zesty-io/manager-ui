import { ConfigProps, DisplayOptionCardProps } from "./types";

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
    titleKey: "shell.integrationTextCard",
    descriptionKey: "shell.integrationTextCardDescription",
    type: "text",
    card: {
      heading: "Chugging through Sri Lanka's tea plantations",
      subHeading: "The beautiful train from Kandy to Ella",
    },
  },
  {
    titleKey: "shell.integrationImageCard",
    descriptionKey: "shell.integrationImageCardDescription",
    type: "image",
    card: {
      heading: "Washington-state-mountain.jpg",
      subHeading: "A photo of a beautiful mountain in the state of Washington",
      thumbnail: "/images/integration-sample-image.png",
    },
  },
  {
    titleKey: "shell.integrationVideoCard",
    descriptionKey: "shell.integrationVideoCardDescription",
    type: "video",
    card: {
      heading: "Chugging through Sri Lanka's tea plantations",
      subHeading: "13:10",
      thumbnail: "/images/integration-sample-video.png",
    },
  },
  {
    titleKey: "shell.integrationDetailsCard",
    descriptionKey: "shell.integrationDetailsCardDescription",
    type: "details",
    card: {
      heading: "John Simons",
      subHeading: "",
      details: [
        {
          key: "position",
          value: 12,
        },
        {
          key: "stats.points",
          value: 22,
        },
      ],
    },
  },
  {
    titleKey: "shell.integrationSimpleCard",
    descriptionKey: "shell.integrationSimpleCardDescription",
    type: "simple",
    card: {
      heading: "Michael James",
    },
  },
];

export const SPECIAL_DISPLAY_TYPES: DisplayOptionCardProps[] = [
  {
    titleKey: "shell.integrationMuxCard",
    descriptionKey: "shell.integrationMuxCardDescription",
    type: "mux",
    card: {
      heading: "HK01Bq7FrEQmIu3QpRiZZ98HQOOZjm6BYyg17eEunlyo",
      subHeading: "13:10",
      thumbnail: "/images/integration-sample-video.png",
    },
  },
  {
    titleKey: "shell.integrationYoutubeCard",
    descriptionKey: "shell.integrationYoutubeCardDescription",
    type: "youtube",
    card: {
      heading: "Chugging through Sri Lanka's tea plantations",
      subHeading: "13:10 • 92M views • 1 month ago",
      thumbnail: "/images/integration-sample-video.png",
    },
  },
  {
    titleKey: "shell.integrationShopifyCard",
    descriptionKey: "shell.integrationShopifyCardDescription",
    type: "shopify",
    card: {
      heading: "Basic Chair",
      subHeading: "Furniture",
      detail: "$73.00",
      thumbnail: "/images/integration-sample-image.png",
    },
  },
  {
    titleKey: "shell.integrationClassyCard",
    descriptionKey: "shell.integrationClassyCardDescription",
    type: "classy",
    card: {
      heading: "Campaign Name",
      subHeading: "Campaign Description",
    },
  },
];

const ITEM_ID: ConfigProps = {
  name: "itemId",
  labelKey: "shell.integrationItemId",
  type: "text",
  isRequired: true,
  placeholderKey: "shell.selectPlaceholder",
};

const HEADING: ConfigProps = {
  name: "heading",
  labelKey: "shell.integrationHeading",
  type: "text",
  isRequired: true,
  placeholderKey: "shell.selectPlaceholder",
};

const SUB_HEADING: ConfigProps = {
  name: "subHeading",
  labelKey: "shell.integrationSubHeading",
  type: "text",
  isRequired: true,
  placeholderKey: "shell.selectPlaceholder",
};

const IMAGE: ConfigProps = {
  name: "thumbnail",
  labelKey: "shell.integrationThumbnail",
  type: "text",
  isRequired: true,
  placeholderKey: "shell.selectPlaceholder",
  descriptionKey: "shell.integrationImageUrlDescription",
};

export const DISPLAY_OPTIONS_CONFIG: Record<string, ConfigProps[]> = {
  simple: [ITEM_ID, HEADING],
  text: [ITEM_ID, HEADING, SUB_HEADING],
  details: [
    ITEM_ID,
    HEADING,
    {
      name: "details",
      labelKey: "shell.integrationDetails",
      type: "option",
      isRequired: true,
      placeholderKey: "shell.selectPlaceholder",
    },
  ],
  image: [ITEM_ID, HEADING, SUB_HEADING, IMAGE],
  video: [ITEM_ID, HEADING, SUB_HEADING, IMAGE],
  shopify: [
    ITEM_ID,
    HEADING,
    SUB_HEADING,
    IMAGE,
    {
      name: "detail",
      labelKey: "shell.integrationDetail",
      type: "text",
      isRequired: true,
      placeholderKey: "shell.selectPlaceholder",
    },
  ],
  youtube: [ITEM_ID, HEADING, SUB_HEADING, IMAGE],
  mux: [ITEM_ID, HEADING, SUB_HEADING, IMAGE],
  classy: [ITEM_ID, HEADING, SUB_HEADING],
};

export const LOADING_DATA = [...Array(10)].map((_, number) => ({
  id: number,
  name: String(number),
}));
