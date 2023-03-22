import {
  InfoRounded,
  LockRounded,
  DataObjectRounded,
  GridViewRounded,
  MenuBookRounded,
  SupportAgentRounded,
  LogoutRounded,
  BookRounded,
  RocketLaunchRounded,
  SvgIconComponent,
} from "@mui/icons-material";
import postmanIcon from "../../../../public/images/postmanIcon.svg";
import graphQLIcon from "../../../../public/images/graphQLIcon.svg";
import parsleyIcon from "../../../../public/images/parsleyIcon.svg";

export type ClickAction = [
  "openUrl" | "openView" | "openEmail" | "logOut",
  string
];
interface MenuItem {
  icon: SvgIconComponent;
  text: string;
  action: ClickAction;
}

interface MainDocItem {
  text: string;
  url: string;
  icon: SvgIconComponent | string;
  iconType: "icon" | "image";
  iconColor?: "primary" | "info";
}

export const MENU_ITEMS: MenuItem[] = [
  {
    icon: InfoRounded,
    text: "Your Profile",
    action: ["openUrl", "https://www.zesty.io/profile/"],
  },
  {
    icon: LockRounded,
    text: "Change Password",
    action: ["openUrl", "https://www.zesty.io/profile/security/"],
  },
  {
    icon: DataObjectRounded,
    text: "Preferences",
    action: ["openUrl", "https://www.zesty.io/profile/preferences/"],
  },
  {
    icon: GridViewRounded,
    text: "View All Instances",
    action: ["openUrl", "https://www.zesty.io/instances/"],
  },
  {
    icon: MenuBookRounded,
    text: "Read Docs",
    action: ["openView", "docs"],
  },
  {
    icon: SupportAgentRounded,
    text: "Get Help",
    action: ["openEmail", ""],
  },
  {
    icon: LogoutRounded,
    text: "Log Out",
    action: ["logOut", ""],
  },
];

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
