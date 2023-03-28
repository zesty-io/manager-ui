import {
  MenuBookRounded,
  BookRounded,
  RocketLaunchRounded,
  SvgIconComponent,
} from "@mui/icons-material";
import postmanIcon from "../../../../public/images/postmanIcon.svg";
import graphQLIcon from "../../../../public/images/graphQLIcon.svg";
import parsleyIcon from "../../../../public/images/parsleyIcon.svg";

interface MainDocItem {
  text: string;
  url: string;
  icon: SvgIconComponent | string;
  iconType: "icon" | "image";
  iconColor?: "primary" | "info";
}

export const MAIN_DOC_ITEMS: MainDocItem[] = [
  {
    text: "Get Started",
    url: "https://zesty.org/quick-start-guide",
    icon: RocketLaunchRounded,
    iconType: "icon",
    iconColor: "primary",
  },
  {
    text: "Platform Docs",
    url: "https://zesty.org",
    icon: MenuBookRounded,
    iconType: "icon",
    iconColor: "info",
  },
  {
    text: "Auth API Docs",
    url: "https://auth-api.zesty.org",
    icon: postmanIcon,
    iconType: "image",
  },
  {
    text: "Instance API Docs",
    url: "https://instances-api.zesty.org",
    icon: postmanIcon,
    iconType: "image",
  },
  {
    text: "GraphQL Docs",
    url: "https://zesty.org/apis/graphql",
    icon: graphQLIcon,
    iconType: "image",
  },
  {
    text: "Parsley Docs",
    url: "https://parsley.zesty.io",
    icon: parsleyIcon,
    iconType: "image",
  },
];

export const SUB_DOC_ITEMS: Pick<MainDocItem, "text" | "url" | "icon">[] = [
  {
    text: "Code Overview",
    url: "https://zesty.org/services/manager-ui/editor",
    icon: BookRounded,
  },
  {
    text: "Editor and Coding Basics",
    url: "https://zesty.org/guides/editor-and-coding-basics",
    icon: BookRounded,
  },
  {
    text: "Schema, Content, and Code",
    url: "https://zesty.org/guides/the-connection-between-schema-content-and-code",
    icon: BookRounded,
  },
];
